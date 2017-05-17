const nodeHapi = require('node-hapi');
const CustomerAddressController = require('../controllers/customer-address');
const helpers = require('node-helpers');
const Joi = require('joi');
const vivuCommon = require('vivu-common-api');
const customerAddressSchema = vivuCommon.schemas.customerAddress;
const SchemaGenerator = helpers.SchemaGenerator;

const customerAddressRoutes = new nodeHapi.Route({
  basePath: 'customer-address',
  controllerClass: CustomerAddressController,
  storeName: 'CustomerAddress',
  schemas: customerAddressSchema
});

customerAddressRoutes.addRoute({
  method: 'PUT',
  path: '/customer-address',
  config: {
    auth: 'validate_basic',
    handler: customerAddressRoutes.controller.insertCustomerAddress,
    description: 'Add address customer',
    notes: 'Return customer address',
    tags: ['api', 'post address customer'],

    validate: {
      headers: helpers.Schema.tokenHeaders,
      payload: Joi.object({
        data: customerAddressSchema.request
      }).requiredKeys(['data'])
    },

    response: {
      schema: SchemaGenerator.basicResponse({
        customerAddress: customerAddressSchema.response
      })
    }
  }
});

customerAddressRoutes.addRoute({
  method: 'POST',
  path: '/customer-address/{id}',
  config: {
    auth: 'validate_token',
    handler: customerAddressRoutes.controller.updateCustomerAddress,
    description: 'Add address customer',
    notes: 'Return customer address',
    tags: ['api', 'post address customer'],

    validate: {
      headers: helpers.Schema.tokenHeaders,
      payload: Joi.object({
        data: customerAddressSchema.request
      }).requiredKeys(['data']),
      params: {
        id: Joi.number()
      }
    },

    response: {
      schema: SchemaGenerator.basicResponse({
        customerAddress: customerAddressSchema.response
      })
    }
  }
});

customerAddressRoutes.addRoute({
  method: 'GET',
  path: '/customer-address',
  config: {
    auth: 'validate_token',
    handler: customerAddressRoutes.controller.getListByCustomer,
    description: 'Get list address customer',
    notes: 'Return list customer address',
    tags: ['api', 'get list address customer'],

    validate: {
      headers: helpers.Schema.tokenHeaders
    },

    response: {
      schema: SchemaGenerator.basicResponse({
        customerAddress: Joi.array().items(customerAddressSchema.response)
      })
    }
  }
});

// customerAddressRoutes.addDeleteRoute({
//   config: {
//     auth: 'validate_token',
//     validate: {
//       headers: helpers.Schema.tokenHeaders
//     }
//   }
// });

customerAddressRoutes.addRoute({
  method: 'DELETE',
  path: '/customer-address/{id}',
  config: {
    auth: 'merge_validate',
    handler: customerAddressRoutes.controller.deleteCustomize,
    description: 'Delete address customer',
    notes: 'Return customer address',
    tags: ['api', 'delete address customer'],

    validate: {
      headers: helpers.Schema.tokenHeaders,
      params: {
        id: Joi.number()
      }
    },

    response: {
      schema: SchemaGenerator.basicResponse({
        customerAddress: customerAddressSchema.response
      })
    }
  }
});


module.exports = customerAddressRoutes.routes;