/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-21T12:44:48+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-02-21T13:27:44+07:00
 */

'use strict';

const helpers = require('node-helpers');
const countrySchema = require('vivu-common-api').schemas.country;

class CountryController {

  getList(request, reply) {

    let countryStore = request.dataStore.getStore('Country');
    return countryStore.getAll().then(rawCountry => {

      let resp = [];
      rawCountry.forEach(e => {
        resp.push(e.responseObject({
          schema: countrySchema.response
        }));
      });

      let responseObject = helpers.Json.response(request, {
        meta: {
          message: 'Get countries successfully'
        },
        data: {
          countries: resp
        }
      });
      return reply(responseObject);

    }).catch(err => {
      return helpers.HAPI.replyError(request, reply, err, {
        log: ['country', 'get list']
      });
    });
  }

}

module.exports = new CountryController();
