/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-16T11:38:00+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-02-16T14:43:38+07:00
 */

'use strict';

const Joi = require('joi');

let response = Joi.object({
  clientId: Joi.string(),
  applicationId: Joi.number(),
  expiry: Joi.number()
});

module.exports = {
  response: response
};
