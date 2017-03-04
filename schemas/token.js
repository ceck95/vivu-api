/*
 * @Author: toan.nguyen
 * @Date:   2016-12-05 17:34:46
 * @Last Modified by:   toan.nguyen
 * @Last Modified time: 2016-12-05 17:51:00
 */

'use strict';

const Joi = require('joi');

let tokenPasswordRequest = Joi.object().keys({
    scope: Joi.string().description('Authorization scope'),
    // password grant
    login: Joi.string().description('Login value (username/email/phone)').required(),
    password: Joi.string().description('Password').required(),
  }),
  tokenRefreshRequest = Joi.object().keys({
    scope: Joi.string().description('Authorization scope'),
    // refresh token
    refreshToken: Joi.string().description('Refresh Token'),
  });

module.exports = {
  passwordRequest: tokenPasswordRequest,
  tokenRequest: tokenRefreshRequest
};
