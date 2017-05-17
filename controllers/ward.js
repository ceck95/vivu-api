/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-03-13T16:38:16+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-03-13T16:59:41+07:00
 */



'use strict';

const helpers = require('node-helpers');
const wardSchema = require('vivu-common-api').schemas.ward;

class WardController {

  get(request, reply) {
    let wardStore = request.dataStore.getStore('Ward'),
      params = request.common.params.filter,
      formRequest = {
        country: (params ? params.country : false) || request.config.i18n.country,
        province: (params ? params.province : false) || request.config.i18n.province,
        district: params.district
      };

    return wardStore.getManyByDistrict(formRequest.country, formRequest.province, formRequest.district).then(results => {

      results.forEach((e, i) => {
        results[i] = wardStore.createModel(e).responseObject({
          schema: wardSchema.response
        });
      });

      let responseObject = helpers.Json.response(request, {
        meta: {
          message: 'Get list wards successfully'
        },
        data: {
          wards: results
        }
      });

      return reply(responseObject);

    }).catch(err => {
      return helpers.HAPI.replyError(request, reply, err, {
        log: ['error', 'get ward', err]
      });
    });

  }

}

module.exports = new WardController();
