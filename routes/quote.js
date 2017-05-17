/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-20T22:05:41+07:00
 * @Email:  tranvannhut4495@gmail.com
 * @Last modified by:   nhutdev
 * @Last modified time: 2017-03-22T13:07:37+07:00
 */

'use strict';

const nodeHapi = require('node-hapi');
const quoteController = require('../controllers/quote');
const helpers = require('node-helpers');
const Joi = require('joi');
const SchemaGenerator = helpers.SchemaGenerator;
const vivuCommon = require('vivu-common-api');
const quoteSchema = vivuCommon.schemas.quote;
const orderSchema = vivuCommon.schemas.order;

const quoteRoutes = new nodeHapi.Route({
  basePath: 'quotes',
  controllerClass: quoteController,
  storeName: 'Quote',
  schemas: quoteSchema
});

quoteRoutes.addRoute({
  method: 'GET',
  path: '/quotes',
  config: {
    auth: 'merge_validate',
    handler: quoteRoutes.controller.getOne,
    description: 'Request quote is stamp item orders',
    notes: 'Returns quote',
    tags: ['api', 'quote'],
    validate: {
      headers: helpers.Schema.mergeHeaders,
      query: {
        'filter[id]': Joi.any()
      }
    },
    response: {
      schema: SchemaGenerator.basicResponse({
        quote: quoteSchema.response
      })
    },
  }
});

quoteRoutes.addRoute({
  method: 'POST',
  path: '/quotes/checkout',
  config: {
    auth: 'merge_validate',
    handler: quoteRoutes.controller.checkout,
    description: 'Request checkout quote',
    notes: 'Returns quote',
    tags: ['api', 'quote'],
    validate: {
      headers: helpers.Schema.tokenHeaders,
      payload: {
        data: quoteSchema.request
      }
    },
    response: {
      schema: SchemaGenerator.basicResponse({
        order: orderSchema.response
      })
    },
  }
});

module.exports = quoteRoutes.routes;