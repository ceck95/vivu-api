/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-10T16:27:47+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-02-21T14:11:45+07:00
 */

'use strict';

const nodeHapi = require('node-hapi');
const customerController = require('../controllers/customer');
const vivuCommon = require('vivu-common-api');
const helpers = require('node-helpers');
const SchemaGenerator = helpers.SchemaGenerator;
const Joi = require('joi');

const customerSchemas = vivuCommon.schemas.customer;

const customerRoutes = new nodeHapi.Route({
  basePath: 'customers',
  controller: customerController
});

customerRoutes.addRoute({
  method: 'POST',
  path: '/customers/register',

  config: {
    auth: 'basic_token',
    handler: customerController.register,
    description: 'Customer registration',
    notes: 'Returns customer data',
    tags: ['api', 'register', 'post customer'],

    validate: {
      headers: helpers.Schema.basicHeaders,
      payload: Joi.object({
        data: customerSchemas.registerRequest
      }).requiredKeys(['data.address', 'data.email', 'data.password'])
    },

    response: {

      schema: SchemaGenerator.basicResponse({
        customer: customerSchemas.response,
        token: helpers.schemas.accessToken.response
      })

    }
  }

});

customerRoutes.addRoute({
  method: 'POST',
  path: '/customers/login',

  config: {
    auth: 'basic_token',
    handler: customerController.ownerPasswordToken,
    description: 'Customer login',
    notes: 'Returns customer data',
    tags: ['api', 'login', 'post customer'],

    validate: {
      headers: helpers.Schema.basicHeaders,
      payload: {
        data: customerSchemas.loginRequest
      }
    },

    response: {

      schema: SchemaGenerator.basicResponse({
        customer: customerSchemas.response,
        token: helpers.schemas.accessToken.response
      })

    }
  }

});

customerRoutes.addRoute({
  method: 'POST',
  path: '/customers/forgot-password',

  config: {
    auth: 'basic_token',
    handler: customerController.forgotPassword,
    description: 'Customer forgot password',
    notes: 'Returns customer data',
    tags: ['api', 'forgot password', 'post customer'],

    validate: {
      headers: helpers.Schema.basicHeaders,
      payload: {
        data: customerSchemas.forgotPasswordRequest
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
    handler: customerController.changePassword,
    description: 'Customer forgot password',
    notes: 'Returns customer data',
    tags: ['api', 'forgot password', 'post customer'],

    validate: {
      headers: helpers.Schema.tokenHeaders,
      payload: {
        data: customerSchemas.changePasswordRequest
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
    handler: customerController.logout,
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
    handler: customerController.getProfile,
    description: 'customer logout',
    notes: 'Returns successful message',
    tags: ['api', 'oauth', 'logout'],

    validate: {
      headers: helpers.Schema.tokenHeaders
    },
    response: {
      schema: SchemaGenerator.basicResponse({
        customer: customerSchemas.response
      })
    },
  }
});

module.exports = customerRoutes.routes;
