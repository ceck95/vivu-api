/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-03-12T23:34:30+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-03-13T16:49:17+07:00
 */


'use strict';

const helpers = require('node-helpers');
const BPromise = require('bluebird');
const vivuCommon = require('vivu-common-api');
const provinceSchema = vivuCommon.schemas.province;
const districtSchema = vivuCommon.schemas.district;
const wardSchema = vivuCommon.schemas.ward;

class ProvinceController {

  getServiceLocation(request, reply) {
    let provinceStore = request.dataStore.getStore('Province'),
      districtStore = request.dataStore.getStore('District'),
      wardStore = request.dataStore.getStore('Ward');

    return BPromise.all([provinceStore.getAll(), districtStore.getAll(), wardStore.getAll()]).then(results => {
      let provinces = results[0],
        districts = results[1],
        wards = results[2];

      provinces.forEach((e, i) => {
        provinces[i] = e.responseObject({
          schema: provinceSchema.response
        });
      });

      districts.forEach((e, i) => {
        districts[i] = e.responseObject({
          schema: districtSchema.response
        });
      });

      wards.forEach((e, i) => {
        wards[i] = e.responseObject({
          schema: wardSchema.response
        });
      });

      districts.forEach((e, i) => {
        wards.forEach(a => {
          if (e.provinceCode == a.provinceCode && e.districtCode == a.districtCode) {
            if (!districts[i].wards) {
              districts[i].wards = [];
            }
            districts[i].wards.push(a);
          }
        });
      });
      provinces.forEach((e, i) => {
        districts.forEach(a => {
          if (e.provinceCode == a.provinceCode) {
            if (!provinces[i].districts) {
              provinces[i].districts = [];
            }
            provinces[i].districts.push(a);
          }
        });
      });

      let responseObject = helpers.Json.response(request, {
        meta: {
          message: 'Get provinces successfully'
        },
        data: {
          provinces: provinces
        }
      });

      return reply(responseObject);

    }).catch(err => {
      return helpers.HAPI.replyError(request, reply, err, {
        log: ['error', 'get provice']
      });
    });
  }

  get(request, reply) {
    let provinceStore = request.dataStore.getStore('Province'),
      params = request.common.params.filter;
    return provinceStore.getManyByCountry((params ? params.country : false) || request.config.i18n.country).then(rawProvinces => {

      rawProvinces.forEach((e, i) => {
        rawProvinces[i] = provinceStore.createModel(e).responseObject({
          schema: provinceSchema.response
        });
      });

      let responseObject = helpers.Json.response(request, {
        meta: {
          message: 'Get list provinces successfully'
        },
        data: {
          provinces: rawProvinces
        }
      });

      return reply(responseObject);

    }).catch(err => {
      return helpers.HAPI.replyError(request, reply, err, {
        log: ['error', 'get province', err]
      });
    });

  }

}

module.exports = new ProvinceController();
