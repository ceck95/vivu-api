/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-03-20T16:43:38+07:00
 * @Email:  tranvannhut4495@gmail.com
 * @Last modified by:   nhutdev
 * @Last modified time: 2017-03-22T13:22:46+07:00
 */

'use strict';

const helpers = require('node-helpers');
const vivuCommon = require('vivu-common-api');
const quoteSchema = vivuCommon.schemas.quote;
const optionTypes = helpers.ttypes.options;
const Controller = require('node-hapi').Controller;
const defaultResources = vivuCommon.resources.default;
const QuoteBusiness = vivuCommon.business.QuoteBusiness;
const orderSchema = vivuCommon.schemas.order;

class QuoteController extends Controller {

  getOne(request, reply) {
    let quoteStore = request.dataStore.getStore('Quote'),
      params = request.common.params,
      id = params.filter.id,
      insertForm = quoteStore.createModel(),
      auth = request.auth.credentials,
      respFunc = (data) => {
        let responseObject = helpers.Json.response(request, {
          meta: {
            message: 'Get quote successfully'
          },
          data: {
            quote: quoteStore.createModel(data).responseObject({
              schema: quoteSchema.response
            })
          }
        });
        return reply(responseObject);
      },
      handler = () => {

        if (auth.profile) {
          insertForm.customerId = auth.profile.id;
        }

        return quoteStore.getOrCreate(insertForm).then(result => {

          if (result.orderId) {
            insertForm.id = null;
            return handler();
          }

          if (result.customerId) {
            if (!auth.profile) {
              insertForm.id = null;
              return handler();
            } else {
              if (result.customerId !== auth.profile.id) {
                insertForm.id = null;
                return handler();
              }
            }
          }
          // if (result.customerId) {
          //   return respFunc(result);
          // }

          // if (auth.profile) {

          //   insertForm.customerId = auth.profile.id;

          //   return quoteStore.updateOne(insertForm, new optionTypes.SelectOptions()).then(rawQuote => {
          //     return respFunc(rawQuote);
          //   }).catch(err => {
          //     return helpers.HAPI.replyError(request, reply, err, {
          //       log: ['error', 'update quote']
          //     });
          //   });

          // }

          return respFunc(result);

        }).catch(err => {
          return helpers.HAPI.replyError(request, reply, err, {
            log: ['error', 'get or create quote']
          });
        });
      };

    if (parseInt(id)) {
      insertForm.id = id;
    }

    if (auth.profile ? auth.profile.id : false) {

      return quoteStore.getOneByCustomer(auth.profile.id).then(rawQuote => {
        if (rawQuote.orderId) {
          insertForm.id = null;
          return handler();
        }
        return respFunc(rawQuote);
      }).catch(() => {
        return handler();
      });

    }

    return handler();

  }

  checkout(request, reply) {
    let form = request.payload.data,
      quoteId = form.quoteId,
      checkoutMethod = form.checkoutMethod,
      orderCheckoutMethod = defaultResources.order.checkoutMethod,
      repFunc = (modelOrder) => {
        let respOrder = modelOrder.responseObject({
          schema: orderSchema.response
        });

        return reply(helpers.Json.response(request, {
          meta: {
            message: 'Check out successfully'
          },
          data: {
            order: respOrder
          }
        }));
      };

    switch (checkoutMethod) {
      case orderCheckoutMethod.cashOnDelivery:
        return QuoteBusiness.cashOnDelivery(request, reply, quoteId, checkoutMethod).then(modelOrder => {
          return repFunc(modelOrder);
        }).catch(err => {
          return helpers.HAPI.replyError(request, reply, err, {
            log: ['error', 'check function']
          });
        });
        break;
      case orderCheckoutMethod.bank:

        break;
      case orderCheckoutMethod.credit:

        break;
      default:
        return reply(request.errorManager.translate({
          code: '504',
          source: 'quote checkout'
        }).code(400));
    }

  }

}

module.exports = QuoteController;