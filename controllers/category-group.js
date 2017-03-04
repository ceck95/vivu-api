/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-26T20:27:30+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-02-26T22:03:43+07:00
 */

'use strict';

const BPromise = require('bluebird');
const helpers = require('node-helpers');
const vivuCommon = require('vivu-common-api');
const categorySchema = vivuCommon.schemas.category;
const categoryGroupSchema = vivuCommon.schemas.categoryGroup;

class CategoryGroupController {

  getList(request, reply) {
    let categoryStore = request.dataStore.getStore('Category'),
      categoryGroupStore = request.dataStore.getStore('CategoryGroup');

    return BPromise.all([categoryStore.getAllActive(), categoryGroupStore.getAllActive()]).then(results => {

      let rawCategory = results[0],
        rawCategoryGroup = results[1];

      for (let a in rawCategoryGroup) {
        for (let b in rawCategory) {
          if (rawCategoryGroup[a].id === rawCategory[b].categoryGroupId) {
            if (!rawCategoryGroup[a].categories) {
              rawCategoryGroup[a].categories = [];
            }
            rawCategoryGroup[a].categories.push(rawCategory[b].responseObject({
              schema: categorySchema.response
            }));
          }
        }
      }

      let resp = [];

      for (let i in rawCategoryGroup) {
        resp.push(rawCategoryGroup[i].responseObject({
          schema: categoryGroupSchema.response
        }));
      }

      let responseObject = helpers.Json.response(request, {
        meta: {
          message: 'Get list category group successfully'
        },
        data: {
          categoriesGroup: resp
        }
      });

      return reply(responseObject);

    }).catch(err => {

      return helpers.HAPI.replyError(request, reply, err, {
        log: ['get category and get category group', 'err']
      });

    });
  }

}
module.exports = new CategoryGroupController();
