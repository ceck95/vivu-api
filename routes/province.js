/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-10T16:27:47+07:00
 * @Email:  tranvannhut4495@gmail.com
 * @Last modified by:   nhutdev
 * @Last modified time: 2017-03-20T16:27:48+07:00
 */

'use strict';

const nodeHapi = require('node-hapi');
const provinceController = require('../controllers/province');
const vivuCommon = require('vivu-common-api');
const helpers = require('node-helpers');
const SchemaGenerator = helpers.SchemaGenerator;
const Joi = require('joi');
const i18nDefault = vivuCommon.config.i18n;

const proviceSchema = vivuCommon.schemas.province;

const provinceRoutes = new nodeHapi.Route({
  basePath: 'services-location',
  controller: provinceController
});

provinceRoutes.addRoute({
  method: 'GET',
  path: '/services-location',

  config: {
    auth: 'merge_validate',
    handler: provinceController.getServiceLocation,
    description: 'List province include districts and wards',
    notes: 'Returns province data',
    tags: ['api', 'get', 'province'],

    validate: {
      headers: helpers.Schema.basicHeaders,
    },

    response: {

      schema: SchemaGenerator.basicResponse({
        provinces: Joi.array().items(proviceSchema.responseMany),
      })

    }
  }

});

provinceRoutes.addRoute({
  method: 'GET',
  path: '/provinces',

  config: {
    auth: 'merge_validate',
    handler: provinceController.get,
    description: 'List province',
    notes: 'Returns province data',
    tags: ['api', 'get', 'province'],

    validate: {
      headers: helpers.Schema.basicHeaders,
      query: {
        'filter[country]': Joi.string().default(i18nDefault.country)
      }
    },

    response: {

      schema: SchemaGenerator.basicResponse({
        provinces: Joi.array().items(proviceSchema.response),
      })

    }
  }

});

module.exports = provinceRoutes.routes;
