/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-10T16:27:47+07:00
 * @Email:  tranvannhut4495@gmail.com
 * @Last modified by:   nhutdev
 * @Last modified time: 2017-03-20T16:27:26+07:00
 */

'use strict';

const nodeHapi = require('node-hapi');
const districtController = require('../controllers/district');
const vivuCommon = require('vivu-common-api');
const helpers = require('node-helpers');
const SchemaGenerator = helpers.SchemaGenerator;
const Joi = require('joi');
const i18nDefault = vivuCommon.config.i18n;

const districtSchema = vivuCommon.schemas.district;

const districtRoutes = new nodeHapi.Route({
  basePath: 'districts',
  controller: districtController
});

districtRoutes.addRoute({
  method: 'GET',
  path: '/districts',

  config: {
    auth: 'merge_validate',
    handler: districtController.get,
    description: 'List districts',
    notes: 'Returns districts data',
    tags: ['api', 'get', 'districts'],

    validate: {
      headers: helpers.Schema.basicHeaders,
      query: {
        'filter[country]': Joi.string().default(i18nDefault.country),
        'filter[province]': Joi.string().default(i18nDefault.province)
      }
    },

    response: {

      schema: SchemaGenerator.basicResponse({
        districts: Joi.array().items(districtSchema.response),
      })

    }
  }

});

module.exports = districtRoutes.routes;
