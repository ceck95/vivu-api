/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-20T22:05:41+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-03-03T11:18:04+07:00
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
    auth: 'merge_token_basic',
    cors: {
      origin: ['*'],
      additionalHeaders: ['cache-control', 'x-requested-with']
    },
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

        order: Joi.any(),
        page: Joi.number().default(1),
        pageSize: Joi.number().default(defaultPageSize),
      }
    },
    response: {
      schema: SchemaGenerator.paginate({
        products: Joi.array().items(productSchema.response)
      })
    },
  }
});

module.exports = productRoutes.routes;
