/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-26T20:09:46+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-02-27T13:31:10+07:00
 */

'use strict';

const nodeHapi = require('node-hapi');
const categoryGroupController = require('../controllers/category-group');
const helpers = require('node-helpers');
const Joi = require('joi');
const SchemaGenerator = helpers.SchemaGenerator;
const categoryGroupSchema = require('vivu-common-api').schemas.categoryGroup;
const config = require('config');
const defaultPageSize = config.has('default.pageSize') ? config.get('default.pageSize') : 20;

const categoryGroupRoutes = new nodeHapi.Route({
  basePath: 'categories-group',
  controller: categoryGroupController
});

categoryGroupRoutes.addRoute({
  method: 'GET',
  path: '/categories-group',
  config: {
    auth: 'merge_token_basic',
    cors: {
      origin: ['*'],
      additionalHeaders: ['cache-control', 'x-requested-with']
    },
    handler: categoryGroupController.getList,
    description: 'Request list category group',
    notes: 'Returns list category group',
    tags: ['api', 'category group'],
    validate: {
      headers: helpers.Schema.mergeHeaders
    },
    response: {
      schema: SchemaGenerator.paginate({
        categoriesGroup: Joi.array().items(categoryGroupSchema.response)
      })
    }
  }
});

module.exports = categoryGroupRoutes.routes;
