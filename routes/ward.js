/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-10T16:27:47+07:00
 * @Email:  tranvannhut4495@gmail.com
 * @Last modified by:   nhutdev
 * @Last modified time: 2017-03-20T16:28:04+07:00
 */

'use strict';

const nodeHapi = require('node-hapi');
const wardController = require('../controllers/ward');
const vivuCommon = require('vivu-common-api');
const helpers = require('node-helpers');
const SchemaGenerator = helpers.SchemaGenerator;
const Joi = require('joi');
const i18nDefault = vivuCommon.config.i18n;

const wardSchema = vivuCommon.schemas.ward;

const wardRoutes = new nodeHapi.Route({
  basePath: 'wards',
  controller: wardController
});

wardRoutes.addRoute({
  method: 'GET',
  path: '/wards',

  config: {
    auth: 'merge_validate',
    handler: wardController.get,
    description: 'List wards',
    notes: 'Returns wards data',
    tags: ['api', 'get', 'wards'],

    validate: {
      headers: helpers.Schema.basicHeaders,
      query: {
        'filter[country]': Joi.string().default(i18nDefault.country),
        'filter[province]': Joi.string().default(i18nDefault.province),
        'filter[district]': Joi.string().required()
      }
    },

    response: {

      schema: SchemaGenerator.basicResponse({
        wards: Joi.array().items(wardSchema.response),
      })

    }
  }

});

module.exports = wardRoutes.routes;
