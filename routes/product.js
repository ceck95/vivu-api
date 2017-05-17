/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-20T22:05:41+07:00
 * @Email:  tranvannhut4495@gmail.com
 * @Last modified by:   nhutdev
 * @Last modified time: 2017-03-23T14:51:43+07:00
 */

'use strict';

const nodeHapi = require('node-hapi');
const productController = require('../controllers/product');
const helpers = require('node-helpers');
const Joi = require('joi');
const SchemaGenerator = helpers.SchemaGenerator;
const productSchema = require('vivu-common-api').schemas.product;
const config = require('config');
const defaultPageSize = config.has('default.pageSize') ? config.get('default.pageSize') : 20;

const productRoutes = new nodeHapi.Route({
  basePath: 'products',
  controller: productController
});

productRoutes.addRoute({
  method: 'GET',
  path: '/products',
  config: {
    auth: 'merge_validate',
    handler: productController.getList,
    description: 'Request list products',
    notes: 'Returns list products',
    tags: ['api', 'product'],
    validate: {
      headers: helpers.Schema.mergeHeaders,
      query: {
        'filter[name]': Joi.any(),
        'filter[sku]': Joi.any(),
        'filter[categoryId]': Joi.any(),
        'filter[categoryGroupId]': Joi.any(),
        'filter[urlKeyCategory]': Joi.any(),
        'filter[urlKeyCategoryGroup]': Joi.any(),
        'filter[search]': Joi.any(),
        'filter[price]': Joi.any(),
        'filter[priceOrder]': Joi.any(),

        order: Joi.any(),
        page: Joi.number().default(1),
        pageSize: Joi.number().default(defaultPageSize),
      }
    },
    response: {
      schema: SchemaGenerator.paginate({
        products: Joi.array().items(productSchema.responseOneForQuoteItem)
      })
    },
  }
});

productRoutes.addRoute({
  method: 'GET',
  path: '/products/home',
  config: {
    auth: 'merge_validate',
    handler: productController.getListHome,
    description: 'Request list products',
    notes: 'Returns list products',
    tags: ['api', 'product'],
    validate: {
      headers: helpers.Schema.mergeHeaders,
      query: {
        'filter[categoryGroupId]': Joi.any().required(),
        'filter[limit]': Joi.any().required(),
        'filter[limitProductRight]': Joi.any().required()
      }
    },
    response: {
      schema: SchemaGenerator.basicResponse({
        products: Joi.array().items(productSchema.responseOneForQuoteItem),
        productsRight: Joi.array().items(productSchema.responseOneForQuoteItem)
      })
    },
  }
});

productRoutes.addRoute({
  method: 'GET',
  path: '/products/{urlKey}',
  config: {
    auth: 'merge_validate',
    handler: productController.get,
    description: 'Request products',
    notes: 'Returns products',
    tags: ['api', 'product'],
    validate: {
      headers: helpers.Schema.mergeHeaders,
      params: {
        urlKey: Joi.string()
      },
      query: {
        'filter[limit]': Joi.any().required()
      }
    },
    response: {
      schema: SchemaGenerator.basicResponse({
        product: productSchema.responseOne,
        products: Joi.array().items(productSchema.response)
      })
    },
  }
});

module.exports = productRoutes.routes;
