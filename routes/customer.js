/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-10T16:27:47+07:00
 * @Email:  tranvannhut4495@gmail.com
 * @Last modified by:   nhutdev
 * @Last modified time: 2017-03-20T16:26:45+07:00
 */

'use strict';

const nodeHapi = require('node-hapi');
const CustomerController = require('../controllers/customer');
const vivuCommon = require('vivu-common-api');
const helpers = require('node-helpers');
const SchemaGenerator = helpers.SchemaGenerator;
const Joi = require('joi');

const customerSchema = vivuCommon.schemas.customer;

const customerRoutes = new nodeHapi.Route({
  basePath: 'customers',
  controllerClass: CustomerController,
  storeName: 'Customer',
  schemas: customerSchema
});

customerRoutes.addRoute({
  method: 'POST',
  path: '/customers/register',

  config: {
    auth: 'validate_basic',
    handler: customerRoutes.controller.register,
    description: 'Customer registration',
    notes: 'Returns customer data',
    tags: ['api', 'register', 'post customer'],

    validate: {
      headers: helpers.Schema.basicHeaders,
      payload: Joi.object({
        data: customerSchema.registerRequest
      }).requiredKeys(['data.address', 'data.email', 'data.password'])
    },

    response: {

      schema: SchemaGenerator.basicResponse({
        customer: customerSchema.response,
        token: helpers.schemas.accessToken.response
      })

    }
  }

});

customerRoutes.addRoute({
  method: 'POST',
  path: '/customers/login',

  config: {
    auth: 'validate_basic',
    handler: customerRoutes.controller.ownerPasswordToken,
    description: 'Customer login',
    notes: 'Returns customer data',
    tags: ['api', 'login', 'post customer'],

    validate: {
      headers: helpers.Schema.basicHeaders,
      payload: {
        data: customerSchema.loginRequest
      }
    },

    response: {

      schema: SchemaGenerator.basicResponse({
        customer: customerSchema.response,
        token: helpers.schemas.accessToken.response
      })

    }
  }

});

customerRoutes.addRoute({
  method: 'POST',
  path: '/customers/forgot-password',

  config: {
    auth: 'validate_basic',
    handler: customerRoutes.controller.forgotPassword,
    description: 'Customer forgot password',
    notes: 'Returns customer data',
    tags: ['api', 'forgot password', 'post customer'],

    validate: {
      headers: helpers.Schema.basicHeaders,
      payload: {
        data: customerSchema.forgotPasswordRequest
      }
    },

    response: {
      schema: SchemaGenerator.basicResponse()
    }
  }

});

customerRoutes.addRoute({
  method: 'POST',
  path: '/customers/change-password',

  config: {
    auth: 'validate_token',
    handler: customerRoutes.controller.changePassword,
    description: 'Customer forgot password',
    notes: 'Returns customer data',
    tags: ['api', 'forgot password', 'post customer'],

    validate: {
      headers: helpers.Schema.tokenHeaders,
      payload: {
        data: customerSchema.changePasswordRequest
      }
    },

    response: {
      schema: SchemaGenerator.basicResponse()
    }
  }

});

customerRoutes.addRoute({
  method: 'POST',
  path: '/customers/logout',
  config: {
    auth: 'validate_token',
    handler: customerRoutes.controller.logout,
    description: 'customer logout',
    notes: 'Returns successful message',
    tags: ['api', 'oauth', 'logout'],

    validate: {
      headers: helpers.Schema.tokenHeaders
    },
    response: {
      schema: SchemaGenerator.basicResponse()
    },
  }
});

customerRoutes.addRoute({
  method: 'GET',
  path: '/customers',
  config: {
    auth: 'validate_token',
    handler: customerRoutes.controller.getProfile,
    description: 'customer logout',
    notes: 'Returns successful message',
    tags: ['api', 'oauth', 'logout'],

    validate: {
      headers: helpers.Schema.tokenHeaders
    },
    response: {
      schema: SchemaGenerator.basicResponse({
        customer: customerSchema.response
      })
    },
  }
});

customerRoutes.addRoute({
  method: 'POST',
  path: '/customers',
  config: {
    auth: 'validate_token',
    handler: customerRoutes.controller.updateProfile,
    description: 'customer logout',
    notes: 'Returns successful message',
    tags: ['api', 'oauth', 'logout'],

    validate: {
      headers: helpers.Schema.tokenHeaders,
      payload: {
        data: customerSchema.request
      }
    },
    response: {
      schema: SchemaGenerator.basicResponse({
        customer: customerSchema.response
      })
    },
  }
});

module.exports = customerRoutes.routes;