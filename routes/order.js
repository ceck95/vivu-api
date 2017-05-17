const nodeHapi = require('node-hapi');
const orderController = require('../controllers/order');
const helpers = require('node-helpers');
const Joi = require('joi');
const SchemaGenerator = helpers.SchemaGenerator;
const orderSchema = require('vivu-common-api').schemas.order;

const orderRoutes = new nodeHapi.Route({
  basePath: 'orders',
  schemas: orderSchema,
  storeName: 'Order',
  controllerClass: orderController
});

orderRoutes.addRoute({
  method: 'GET',
  path: '/orders',
  config: {
    auth: 'validate_token',
    handler: orderRoutes.controller.getList,
    description: 'Return list orders',
    notes: 'Get list orders',
    tags: ['api', 'get', 'list', 'order'],
    validate: {
      headers: helpers.Schema.tokenHeaders
    },
    response: {
      schema: SchemaGenerator.basicResponse({
        orders: Joi.array().items(orderSchema.responseItem)
      })
    },
  }
});


module.exports = orderRoutes.routes;