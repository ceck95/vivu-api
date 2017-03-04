/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-12T09:40:40+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-02-22T21:43:41+07:00
 */

'use strict';

const helpers = require('node-helpers');
const BPromise = require('bluebird');
const bcrypt = BPromise.promisifyAll(require('bcrypt'));
const vivuCommon = require('vivu-common-api');
const customerSchema = vivuCommon.schemas.customer;
const customerAddressSchema = vivuCommon.schemas.customerAddress;
const tokenBusiness = vivuCommon.business.TokenBusiness;

class CustomerController {

  register(request, reply) {

    let form = request.payload.data,
      customerStore = request.dataStore.getStore('Customer'),
      customerAddressStore = request.dataStore.getStore('CustomerAddress'),
      saltRounds = request.config.security.saltRounds,
      params = request.auth.credentials,
      countryStore = request.dataStore.getStore('Country');
    return customerStore.getOneByEmail(form.email).then(() => {

      return reply(request.errorManager.translate({
        code: '110',
        source: 'register customer'
      })).code(400);

    }).catch(() => {

      return bcrypt.hashAsync(form.password, saltRounds).then((hash) => {

        let customerForm = customerStore.createModel(form);
        customerForm.passwordHash = hash;

        return customerStore.insertOne(customerForm).then(rawCustomer => {

          return tokenBusiness.createBearerToken(request, {
            hasRefreshToken: true,
            expiry: params.expiry,
            applicationId: params.applicationId,
            rawCustomer: rawCustomer
          }).then(token => {

            let type = customerAddressStore.createModel().typeAddress,
              modelCustomerAddress = customerAddressStore.createModel(form.address);

            let func = (name) => {
              modelCustomerAddress.customerId = rawCustomer.id;
              modelCustomerAddress.type = type.CustomerAddress;
              modelCustomerAddress.isDefault = true;
              modelCustomerAddress.phone = rawCustomer.phone;
              modelCustomerAddress.fullName = `${form.address.street},${form.address.city},${name}`;

              return customerAddressStore.insertOne(modelCustomerAddress).then(rawAddress => {

                let resp = customerStore.createModel(rawCustomer).responseObject({
                  schema: customerSchema.response
                });

                resp.address = customerAddressStore.createModel(rawAddress).responseObject({
                  schema: customerAddressSchema.response
                });

                let responseObject = helpers.Json.response(request, {
                  meta: {
                    message: 'Register customer successfully'
                  },
                  data: {
                    customer: resp,
                    token: token
                  }
                });

                return reply(responseObject);

              }).catch(err => {
                return helpers.HAPI.replyError(request, reply, err, {
                  log: ['register', 'insert customer address']
                });
              });

            };

            return countryStore.getOne(form.address.countryCode).then(rawCountry => {
              return func(rawCountry.name);
            }).catch(err => {
              request.log(['get country', err]);
              if (request.config.i18n.country) {

                return countryStore.getOne(request.config.i18n.country).then(rawCountry => {
                  return func(rawCountry.name);
                }).catch(err => {
                  return helpers.HAPI.replyError(request, reply, err, {
                    log: ['get country', err]
                  });
                });

              }

              return reply(request.errorManager.translate({
                code: '503',
                params: {
                  countryCode: form.address.countryCode
                }
              })).code(400);

            });
          }).catch(err => {

            return helpers.HAPI.replyError(request, reply, err, {
              log: ['register', 'insert beaer token access']
            });

          });

        }).catch(err => {

          return helpers.HAPI.replyError(request, reply, err, {
            log: ['register', 'insert customer']
          });

        });

      });

    });

  }

  ownerPasswordToken(request, reply) {

    let userStore = request.dataStore.userStore,
      form = request.payload.data,
      params = request.auth.credentials;

    let func = (prom) => {

      return prom.then((rawUser) => {
        return bcrypt.compareAsync(form.password, rawUser.passwordHash, (err, res) => {

          if (err) {
            return helpers.HAPI.replyError(request, reply, err, {
              log: ['error', 'oauth', 'password']
            });
          }

          if (res === false) {

            let errors = helpers.Error.translate({
              code: '112',
              source: 'password'
            });

            return reply(errors).code(400);
          }

          return tokenBusiness.createBearerToken(request, {
            hasRefreshToken: true,
            expiry: params.expiry,
            applicationId: params.applicationId,
            rawCustomer: rawUser
          }).then((response) => {

            let user = userStore.createModel(rawUser);

            let responseObject = helpers.Json.response(request, {
              data: {
                customer: user.responseObject({
                  schema: customerSchema.response
                }),
                token: response
              }
            });

            return reply(responseObject);
          });

        });
      }).catch((e) => {
        let errors = helpers.Error.translate(e),
          code = helpers.Error.getCode(errors);
        if (code == '202') {
          let userNotFound = helpers.Error.translate({
            code: '315',
            source: 'login'
          });
          return reply(userNotFound).code(400);
        }

        return helpers.HAPI.replyError(request, reply, errors, {
          log: ['error', 'oauth', 'password'],
          rawError: e
        });
      });
    };

    if (helpers.Stringer.isEmail(form.login)) {
      return func(userStore.getOneByEmail(form.login));
    }

  }

  logout(request, reply) {
    let profile = request.auth.credentials.profile,
      token = request.auth.credentials.token;

    return tokenBusiness.revokeTokens(request, {
      applicationId: token.applicationId,
      userId: profile.id
    }).then(() => {
      let respObj = helpers.Json.response(request, {
        meta: {
          message: 'Logout successfully'
        }
      });

      return reply(respObj);
    });
  }

  forgotPassword(request, reply) {
    let form = request.payload.data,
      customerStore = request.dataStore.getStore('Customer');
    let func = (prom) => {

      return prom.then(rawCustomer => {
        let passwordLength = request.config.security.passwordLength || 6,
          passwordNew = helpers.Stringer.randomChars(passwordLength, '0123456789'),
          saltRounds = request.config.security.saltRounds;

        return bcrypt.hashAsync(passwordNew, saltRounds).then((hashedPassword) => {

          return customerStore.changePassword(rawCustomer.id, hashedPassword).then(() => {

            let responseObject = helpers.Json.response(request, {
              meta: {
                message: 'Password new sent email'
              }
            });

            let mailHelper = new helpers.Mailer();

            mailHelper.send({
              to: rawCustomer.email, // list of receivers
              subject: '[Vivu] Reset password', // Subject line
              html: '<h1>Reset password</h1><p>Your new password is: <b>' + passwordNew + '</b></p>', // html body
            }).then((result) => {
              request.log(['info'], `Sent Email to user successfully: ${result}`);
            }).catch((err) => {
              request.log(['error', 'sent email forgot password'], err);
            });

            return reply(responseObject);

          }).catch(err => {

            return helpers.HAPI.replyError(request, reply, err, {
              log: ['hashed password', 'customer']
            });

          });

        }).catch(err => {

          return helpers.HAPI.replyError(request, reply, err, {
            log: ['hashed password', 'customer']
          });


        });

      }).catch(() => {

        return reply(request.errorManager.translate({
          code: '315',
          source: 'forgot password'
        })).code(400);

      });

    };

    if (helpers.Stringer.isEmail(form.login)) {
      return func(customerStore.getOneByEmail(form.login));
    }

  }

  changePassword(request, reply) {

    let form = request.payload.data,
      customer = request.auth.credentials.profile,
      customerStore = request.dataStore.getStore('Customer');

    let func = (rawCustomer) => {

      return bcrypt.compareAsync(form.passwordOld, rawCustomer.passwordHash).then((res) => {
        if (res) {
          let saltRounds = request.config.security.saltRounds;
          return bcrypt.hashAsync(form.passwordNew, saltRounds).then((hashedPassword) => {

            customerStore.changePassword(rawCustomer.id, hashedPassword).then(() => {

              let responseObject = helpers.Json.response(request, {
                meta: {
                  message: 'Change password successfully'
                }
              });

              return reply(responseObject);

            }).catch(err => {

              return helpers.HAPI.replyError(request, reply, err, {
                log: ['change password', 'customer']
              });

            });

          }).catch(err => {

            return helpers.HAPI.replyError(request, reply, err, {
              log: ['change password', 'customer']
            });

          });
        }

        return reply(request.errorManager.translate({
          code: '112',
          source: 'password'
        })).code(400);


      }).catch(() => {

        return reply(request.errorManager.translate({
          code: '112',
          source: 'password'
        })).code(400);

      });

    };

    return func(customer);

  }

  getProfile(request, reply) {

    let profile = request.auth.credentials.profile;
    let resp = profile.responseObject({
      schema: customerSchema.response
    });
    resp.address = profile.address.responseObject({
      schema: customerAddressSchema.response
    });

    let responseObject = helpers.Json.response(request, {
      meta: {
        message: 'Get profile successfully'
      },
      data: {
        customer: resp
      }
    });
    reply(responseObject);

  }

}

module.exports = new CustomerController();
