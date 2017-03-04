/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-16T11:20:29+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-02-16T15:03:23+07:00
 */

'use strict';

const nodeHapi = require('node-hapi');
const clientController = require('../controllers/client');
const Joi = require('joi');
const helpers = require('node-helpers');
const clientSchema = require('../schemas/client');
const SchemaGenerator = helpers.SchemaGenerator;

let clientRoutes = new nodeHapi.Route({
  basePath: 'clients',
  controller: clientController
});

clientRoutes.addRoute({
  method: 'POST',
  path: '/clients/register',

  config: {
    handler: clientController.insertClient,
    description: 'Client create',
    notes: 'Returns client data',
    tags: ['api', 'create', 'client'],
    validate: {
      payload: Joi.object({
        data: Joi.object({
          clientId: Joi.string(),
          applicationId: Joi.number(),
          expiry: Joi.number()
        })
      }).requiredKeys(['data.clientId'])
    },

    response: {
      schema: SchemaGenerator.basicResponse({
        client: clientSchema.response
      })

    }
  }

});

module.exports = clientRoutes.routes;
