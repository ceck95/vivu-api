/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-20T22:05:41+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-02-21T13:27:32+07:00
 */

'use strict';

const nodeHapi = require('node-hapi');
const countryController = require('../controllers/country');
const helpers = require('node-helpers');
const Joi = require('joi');
const SchemaGenerator = helpers.SchemaGenerator;
const countrySchema = require('vivu-common-api').schemas.country;

const countryRoutes = new nodeHapi.Route({
  basePath: 'countries',
  controller: countryController
});

countryRoutes.addRoute({
  method: 'GET',
  path: '/countries',
  config: {
    auth: 'basic_token',
    handler: countryController.getList,
    description: 'Request country code from country on the word',
    notes: 'Returns list country',
    tags: ['api', 'country'],
    validate: {
      headers: helpers.Schema.basicHeaders,
    },
    response: {
      schema: SchemaGenerator.basicResponse({
        countries: Joi.array().items(countrySchema.response)
      })
    },
  }
});

module.exports = countryRoutes.routes;
