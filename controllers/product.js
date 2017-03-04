/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-23T15:18:09+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-03-04T08:50:28+07:00
 */

'use strict';

const helpers = require('node-helpers');
const vivuCommon = require('vivu-common-api');
const vivuSchema = vivuCommon.schemas.product;
const Pagination = helpers.models.Pagination;

class ProductController {

  getList(request, reply) {

    let productStore = request.dataStore.getStore('Product'),
      pagingParams = request.common.pagingParams,
      categoryStore = request.dataStore.getStore('Category'),
      categoryGroupStore = request.dataStore.getStore('CategoryGroup'),
      params = request.common.params,
      filterModel = productStore.createModel();

    filterModel.urlKeyCategory = '';
    filterModel.urlKeyCategoryGroup = '';
    if (params.filter) {
      helpers.Model.assignData(filterModel, params.filter);
    }

    pagingParams.includes = [categoryStore.createModel().tableAlias, categoryGroupStore.createModel().tableAlias];

    return productStore.filterPagination(filterModel, pagingParams).then(rawPaging => {

      let respProducts = [];
      rawPaging.data.forEach(e => {
        respProducts.push(productStore.createModel(e).responseObject({
          schema: vivuSchema.response
        }));
      });

      let pagination = new Pagination(rawPaging, params),
        responseObject = pagination.response(request, {
          meta: {
            message: 'Get list product successfully'
          },
          data: {
            products: respProducts
          }
        });

      return reply(responseObject);

    }).catch(err => {

      return helpers.HAPI.replyError(request, reply, err, {
        log: ['error', 'list product']
      });

    });

  }

}

module.exports = new ProductController();
