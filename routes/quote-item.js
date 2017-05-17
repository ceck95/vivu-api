/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-20T22:05:41+07:00
 * @Email:  tranvannhut4495@gmail.com
 * @Last modified by:   nhutdev
 * @Last modified time: 2017-03-24T08:24:22+07:00
 */

const nodeHapi = require('node-hapi');
const quoteItemController = require('../controllers/quote-item');
const helpers = require('node-helpers');
const Joi = require('joi');
const SchemaGenerator = helpers.SchemaGenerator;
const quoteItemSchema = require('vivu-common-api').schemas.quoteItem;

const quoteItemRoutes = new nodeHapi.Route({
  basePath: 'quote-items',
  schemas: quoteItemSchema,
  storeName: 'QuoteItem',
  controllerClass: quoteItemController
});

quoteItemRoutes.addRoute({
  method: 'PUT',
  path: '/quote-items/{quoteId}',
  config: {
    auth: 'merge_validate',
    handler: quoteItemRoutes.controller.insertCustomize,
    description: 'Request insert quote item',
    notes: 'Returns quote item',
    tags: ['api', 'quote item'],
    validate: {
      headers: helpers.Schema.mergeHeaders,
      params: {
        quoteId: Joi.number()
      },
      payload: {
        data: quoteItemSchema.request
      }
    },
    response: {
      schema: SchemaGenerator.basicResponse({
        quoteItem: quoteItemSchema.response
      })
    },
  }
});

quoteItemRoutes.addRoute({
  method: 'GET',
  path: '/quote-items/{quoteId}',
  config: {
    auth: 'merge_validate',
    handler: quoteItemRoutes.controller.getListCustomize,
    description: 'Request insert list item',
    notes: 'Returns list quote item',
    tags: ['api', 'quote item'],
    validate: {
      headers: helpers.Schema.mergeHeaders,
      params: {
        quoteId: Joi.number()
      }
    },
    response: {
      schema: SchemaGenerator.basicResponse({
        quoteItems: Joi.array().items(quoteItemSchema.response)
      })
    },
  }
});

quoteItemRoutes.addRoute({
  method: 'DELETE',
  path: '/quote-items/{id}',
  config: {
    auth: 'merge_validate',
    handler: quoteItemRoutes.controller.delete,
    description: 'Request insert quote item',
    notes: 'Returns quote item',
    tags: ['api', 'quote item'],
    validate: {
      headers: helpers.Schema.mergeHeaders,
      params: {
        id: Joi.number()
      }
    },
    response: {
      schema: SchemaGenerator.basicResponse({
        quoteItem: quoteItemSchema.response
      })
    },
  }
});

quoteItemRoutes.addRoute({
  method: 'POST',
  path: '/quote-items/{id}',
  config: {
    auth: 'merge_validate',
    handler: quoteItemRoutes.controller.updateCustomize,
    description: 'Request update quote item',
    notes: 'Returns quote item',
    tags: ['api', 'quote item'],
    validate: {
      headers: helpers.Schema.mergeHeaders,
      params: {
        id: Joi.number()
      },
      payload: {
        data: {
          quantity: Joi.number()
        }
      }
    },
    response: {
      schema: SchemaGenerator.basicResponse({
        quoteItem: quoteItemSchema.response
      })
    },
  }
});

module.exports = quoteItemRoutes.routes;
