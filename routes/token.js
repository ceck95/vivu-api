/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-20T22:05:41+07:00
 * @Email:  tranvannhut4495@gmail.com
 * @Last modified by:   nhutdev
 * @Last modified time: 2017-03-20T16:27:57+07:00
 */

'use strict';

const nodeHapi = require('node-hapi');
const tokenController = require('../controllers/token');
const helpers = require('node-helpers');
const Joi = require('joi');
const SchemaGenerator = helpers.SchemaGenerator;
const tokenSchema = require('../schemas/token');

const tokenRoutes = new nodeHapi.Route({
  basePath: 'token',
  controller: tokenController
});

tokenRoutes.addRoute({
  method: 'POST',
  path: '/tokens/refresh',
  config: {
    auth: 'validate_basic',
    handler: tokenController.refreshToken,
    description: 'Request token from server, using refresh token grant type',
    notes: 'Returns a access token item',
    tags: ['api', 'oauth', 'accesstoken'],
    validate: {
      headers: helpers.Schema.basicHeaders,
      payload: Joi.object().keys({
        data: tokenSchema.tokenRequest
      }).requiredKeys(['data'])
    },
    response: {
      schema: SchemaGenerator.basicResponse({
        token: helpers.schemas.accessToken.response
      })
    },
  }
});

module.exports = tokenRoutes.routes;
