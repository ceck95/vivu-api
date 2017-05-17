/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-03-13T16:38:11+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-03-13T16:53:52+07:00
 */

'use strict';

const helpers = require('node-helpers');
const districtSchema = require('vivu-common-api').schemas.district;

class DistrictController {

  get(request, reply) {
    let districtStore = request.dataStore.getStore('District'),
      params = request.common.params.filter,
      formRequest = {
        country: (params ? params.country : false) || request.config.i18n.country,
        province: (params ? params.province : false) || request.config.i18n.province
      };

    return districtStore.getManyByProvince(formRequest.country, formRequest.province).then(results => {

      results.forEach((e, i) => {
        results[i] = districtStore.createModel(e).responseObject({
          schema: districtSchema.response
        });
      });

      let responseObject = helpers.Json.response(request, {
        meta: {
          message: 'Get list districts successfully'
        },
        data: {
          districts: results
        }
      });

      return reply(responseObject);

    }).catch(err => {
      return helpers.HAPI.replyError(request, reply, err, {
        log: ['error', 'get district', err]
      });
    });

  }


}

module.exports = new DistrictController();
