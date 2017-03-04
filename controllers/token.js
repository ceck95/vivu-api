/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-20T22:10:55+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-02-20T23:16:43+07:00
 */

'use strict';

const helpers = require('node-helpers');
const commonVivu = require('vivu-common-api');
const tokenBusiness = commonVivu.business.TokenBusiness;

class TokenController {
  refreshToken(request, reply) {

    let tokenStore = request.dataStore.getStore('AccessToken'),
      form = request.payload.data,
      model = tokenStore.createModel(),
      query = model.toThriftQuery({
        refreshToken: form.refreshToken
      }),
      params = request.auth.credentials;

    return tokenStore.getOne(query).then((token) => {

      return tokenBusiness.createBearerToken(request, {
        hasRefreshToken: true,
        expiry: params.expiry,
        applicationId: params.applicationId,
        rawCustomer: {
          id: token.userId
        }
      }).then((response) => {
        let responseObject = helpers.Json.response(request, {
          data: {
            token: response
          }
        });

        request.log(['debug', 'oauth', 'response', 'refresh_token'], response);
        return reply(responseObject);

      });
    }).catch((e) => {
      let errors = helpers.Error.translate(e),
        code = helpers.Error.getCode(errors),
        notFound = helpers.Error.translate({
          code: '305',
        });

      // if (code != '202') {
      //   return helpers.HAPI.replyError(request, reply, errors, {
      //     log: ['error', 'oauth', 'refresh-token'],
      //     rawError: e
      //   });
      // }

      return reply(notFound).code(400);
    });
  }
}

module.exports = new TokenController();
