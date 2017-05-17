/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-03-20T16:43:38+07:00
 * @Email:  tranvannhut4495@gmail.com
 * @Last modified by:   nhutdev
 * @Last modified time: 2017-03-25T09:36:35+07:00
 */

'use strict';

const helpers = require('node-helpers');
const vivuCommon = require('vivu-common-api');
const quoteItemSchema = vivuCommon.schemas.quoteItem;
const productSchema = vivuCommon.schemas.product;
const productColorSchema = vivuCommon.schemas.productColor;
const optionTypes = helpers.ttypes.options;
const Controller = require('node-hapi').Controller;

class QuoteItemController extends Controller {

  insertCustomize(request, reply) {

    let quoteItemStore = request.dataStore.getStore('QuoteItem'),
      productStore = request.dataStore.getStore('Product'),
      productColorStore = request.dataStore.getStore('ProductColor'),
      form = request.payload.data,
      selectOptions = new optionTypes.SelectOptions(),
      quoteId = request.params.quoteId;

    selectOptions.includes = [productColorStore.tableAlias];

    return productStore.getOneProductAndProductColor(form.productId, form.selectedProductColorId, selectOptions).then(rawProduct => {
      let basePrice = rawProduct.basePrice + rawProduct.productColor.price,
        respFunc = (rawQuoteItem) => {

          let resp = quoteItemStore.createModel(rawQuoteItem).responseObject({
            schema: quoteItemSchema.response
          });
          resp.product = productStore.createModel(rawProduct).responseObject({
            schema: productSchema.responseOneForQuoteItem
          });
          resp.product.productColor = productColorStore.createModel(rawProduct.productColor).responseObject({
            schema: productColorSchema.responseOne
          });

          let responseObject = helpers.Json.response(request, {
            meta: {
              message: 'Insert quote item successfully'
            },
            data: {
              quoteItem: resp
            }
          });

          return reply(responseObject);
        };

      return quoteItemStore.getOneByProductAndProductColor(form.productId, form.selectedProductColorId, quoteId).then(rawQuoteItem => {

        let selectOptions = new optionTypes.SelectOptions(),
          quantity = rawQuoteItem.quantity + form.quantity,
          formUpdate = quoteItemStore.createModel({
            id: rawQuoteItem.id,
            quantity: quantity,
            basePrice: quantity * basePrice
          });

        return quoteItemStore.updateOne(formUpdate, selectOptions).then(rawQuoteItem => {
          return respFunc(rawQuoteItem);
        }).catch(err => {
          return helpers.HAPI.replyError(request, reply, err, {
            log: ['error', 'update quote item']
          });
        });

      }).catch(() => {
        let formInsertQuoteItem = quoteItemStore.createModel({
          quoteId: quoteId,
          productId: form.productId,
          selectedProductColorId: form.selectedProductColorId,
          quantity: form.quantity,
          basePrice: basePrice * form.quantity
        });

        return quoteItemStore.insertOne(formInsertQuoteItem).then(rawQuoteItem => {
          return respFunc(rawQuoteItem);
        }).catch(err => {
          return helpers.HAPI.replyError(request, reply, err, {
            log: ['error', 'insert quote item']
          });
        });
      });

    }).catch(err => {
      return helpers.HAPI.replyError(request, reply, err, {
        log: ['error', 'get product']
      });
    });

  }

  getListCustomize(request, reply) {
    let quoteItemStore = request.dataStore.getStore('QuoteItem'),
      productStore = request.dataStore.getStore('Product'),
      productColorStore = request.dataStore.getStore('ProductColor'),
      selectOptions = new optionTypes.SelectOptions(),
      quoteId = request.params.quoteId;

    selectOptions.includes = [productStore.tableAlias, productColorStore.tableAlias];

    return quoteItemStore.getManyByQuote(quoteId, selectOptions).then(rawQuoteItem => {

      rawQuoteItem.forEach((e, i) => {

        rawQuoteItem[i] = quoteItemStore.createModel(e).responseObject({
          schema: quoteItemSchema.response
        });

        rawQuoteItem[i].product = productStore.createModel(e.product).responseObject({
          schema: productSchema.responseOneForQuoteItem
        });

        rawQuoteItem[i].product.productColor = productColorStore.createModel(e.productColor).responseObject({
          schema: productColorSchema.response
        });

      });

      let responseObject = helpers.Json.response(request, {
        meta: {
          message: 'Get many quote item successfully'
        },
        data: {
          quoteItems: rawQuoteItem
        }
      });

      return reply(responseObject);

    }).catch(err => {
      return helpers.HAPI.replyError(request, reply, err, {
        log: ['error', 'get many quote item']
      });
    });

  }

  updateCustomize(request, reply) {
    let quoteItemStore = request.dataStore.getStore('QuoteItem'),
      form = request.payload.data;
    form.id = request.params.id;
    let formUpdate = quoteItemStore.createModel(form),
      selectOptions = new optionTypes.SelectOptions(),
      productStore = request.dataStore.getStore('Product'),
      productColorStore = request.dataStore.getStore('ProductColor');

    selectOptions.includes = [productColorStore.tableAlias];

    return quoteItemStore.getOneByPk(form.id).then(rawQuoteItem => {

      return productStore.getOneProductAndProductColor(rawQuoteItem.productId, rawQuoteItem.selectedProductColorId, selectOptions).then(rawProduct => {
        let basePrice = rawProduct.basePrice + rawProduct.productColor.price;
        formUpdate.basePrice = form.quantity * basePrice;

        return quoteItemStore.updateOne(formUpdate).then(result => {

          result = quoteItemStore.createModel(result).responseObject({
            schema: quoteItemSchema.response
          });

          let responseObject = helpers.Json.response(request, {
            meta: {
              message: 'Update quote item successfully'
            },
            data: {
              quoteItem: result
            }
          });

          return reply(responseObject);

        }).catch(err => {
          return helpers.HAPI.replyError(request, reply, err, {
            log: ['error', 'update quote item']
          });
        });
      }).catch(err => {
        return helpers.HAPI.replyError(request, reply, err, {
          log: ['error', 'get quote item']
        });
      });
    }).catch(err => {
      return helpers.HAPI.replyError(request, reply, err, {
        log: ['error', 'get quote item']
      });
    });
  }

}

module.exports = QuoteItemController;
