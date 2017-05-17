const Controller = require('node-hapi').Controller;
const helpers = require('node-helpers');
const vivuCommon = require('vivu-common-api');
const customerAddressSchema = vivuCommon.schemas.customerAddress;
const customerAddressBusiness = vivuCommon.business.CustomerAddressBusiness;
const options = helpers.ttypes.options;

class CustomerAddress extends Controller {

  getListByCustomer(request, reply) {
    let customerAddressStore = request.dataStore.getStore('CustomerAddress');

    return customerAddressStore.getManyByCustomer(request.auth.credentials.profile.id).then(result => {

      result.forEach((e, i) => {
        result[i] = customerAddressStore.createModel(e).responseObject({
          schema: customerAddressSchema.response
        });
      });

      let responseObject = helpers.Json.response(request, {
        meta: {
          message: 'Get list customer address successfully'
        },
        data: {
          customerAddress: result
        }
      });

      return reply(responseObject);

    }).catch(err => {
      return helpers.HAPI.replyError(request, reply, err, {
        log: ['err', 'get list customer address']
      });
    });
  }

  insertCustomerAddress(request, reply) {

    let customerAddressStore = request.dataStore.getStore('CustomerAddress'),
      form = request.payload.data,
      auth = request.auth.credentials,
      insertFunc = () => {
        return customerAddressBusiness.getStringAddress(request, reply, form).then(string => {
          form.province = string.province;
          form.district = string.district;
          form.ward = string.ward;
          form.fullName = string.fullName;
          if (auth.profile) {
            form.customerId = request.auth.credentials.profile.id;
          }

          return customerAddressStore.insertOne(customerAddressStore.createModel(form)).then(result => {

            return reply(helpers.Json.response(request, {
              meta: {
                message: 'Insert customer address successfully'
              },
              data: {
                customerAddress: customerAddressStore.createModel(result).responseObject({
                  schema: customerAddressSchema.response
                })
              }
            }));

          }).catch(err => {
            return helpers.HAPI.replyError(request, reply, err, {
              log: ['error', 'insert customer address']
            });
          });
        }).catch(err => {
          return helpers.HAPI.replyError(request, reply, err, {
            log: ['error', 'get string customer address']
          });
        });
      };

    if (form.isDefault) {
      return customerAddressBusiness.handleCustomerAddressDefault(request, reply, null, false, null).then(() => {
        return insertFunc();
      });
    }
    return insertFunc();

  }

  updateCustomerAddress(request, reply) {

    let customerAddressStore = request.dataStore.getStore('CustomerAddress'),
      form = request.payload.data,
      customerAddressId = request.params.id,
      selectOptions = new options.SelectOptions(),
      updateFunc = () => {
        return customerAddressBusiness.getStringAddress(request, reply, form).then(string => {

          form.province = string.province;
          form.district = string.district;
          form.ward = string.ward;
          form.fullName = string.fullName;
          form.id = customerAddressId;
          return customerAddressStore.updateOne(customerAddressStore.createModel(form), selectOptions).then(result => {

            return reply(helpers.Json.response(request, {
              meta: {
                message: 'Update customer address successfully'
              },
              data: {
                customerAddress: customerAddressStore.createModel(result).responseObject({
                  schema: customerAddressSchema.response
                })
              }
            }));

          }).catch(err => {
            return helpers.HAPI.replyError(request, reply, err, {
              log: ['errors', 'update customer address']
            });
          });

        }).catch(err => {
          return helpers.HAPI.replyError(request, reply, err, {
            log: ['error', 'get string address']
          });
        });
      };

    if (form.isDefault) {
      return customerAddressBusiness.handleCustomerAddressDefault(request, reply, customerAddressId, true, updateFunc);
    }

    return updateFunc();

  }

  deleteCustomize(request, reply) {
    let customerAddressStore = request.dataStore.getStore('CustomerAddress'),
      customerAddressId = request.params.id,
      deleteFunc = () => {
        let formDelete = customerAddressStore.createModel({
          id: customerAddressId,
          status: helpers.Const.status.DELETED
        });
        return customerAddressStore.updateOne(formDelete).then(result => {

          return reply(helpers.Json.response(request, {
            meta: {
              message: 'Delete customer address successfully'
            },
            data: {
              customerAddress: customerAddressStore.createModel(result).responseObject({
                schema: customerAddressSchema.response
              })
            }
          }));

        }).catch(err => {
          return helpers.HAPI.replyError(request, reply, err, {
            log: ['errors', 'update delete customer address']
          });
        });
      },
      profile = request.auth.credentials.profile;

    if (profile) {
      if (profile.address.id === customerAddressId) {
        return reply(request.errorManager.translate({
          code: '507',
          source: 'Delete customer address'
        })).code(400);
      }
      return deleteFunc();
    }
    return deleteFunc();
  }

}

module.exports = CustomerAddress;