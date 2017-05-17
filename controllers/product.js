/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-23T15:18:09+07:00
 * @Email:  tranvannhut4495@gmail.com
 * @Last modified by:   nhutdev
 * @Last modified time: 2017-03-27T16:35:53+07:00
 */

'use strict';

const helpers = require('node-helpers');
const vivuCommon = require('vivu-common-api');
const BPromise = require('bluebird');
const productSchema = vivuCommon.schemas.product;
const Pagination = helpers.models.Pagination;
const optionTypes = helpers.ttypes.options;
const productColorSchema = vivuCommon.schemas.productColor;
const productColorPreviewImageSchema = vivuCommon.schemas.productColorPreviewImage;
const ProductBusiness = vivuCommon.business.ProductBusiness;

class ProductController {

  getList(request, reply) {

    let productStore = request.dataStore.getStore('Product'),
      pagingParams = request.common.pagingParams,
      categoryStore = request.dataStore.getStore('Category'),
      productColorStore = request.dataStore.getStore('ProductColor'),
      categoryGroupStore = request.dataStore.getStore('CategoryGroup'),
      params = request.common.params,
      filterModel = productStore.createModel();

    filterModel.urlKeyCategory = '';
    filterModel.urlKeyCategoryGroup = '';
    if (params.filter) {
      helpers.Model.assignData(filterModel, params.filter);
    }
    pagingParams.includes = [categoryStore.tableAlias, categoryGroupStore.tableAlias, productColorStore.tableAlias];
    if (params.filter.priceOrder === 'asc') {
      pagingParams.order = `${productStore.tableAlias}.base_price`;
    } else if (params.filter.priceOrder === 'desc') {
      pagingParams.order = `-${productStore.tableAlias}.base_price`;
    } else {
      pagingParams.order = `-${productStore.tableAlias}.created_at`;
    }
    filterModel.categoryGroupId = params.filter.categoryGroupId;

    if (params.filter.price) {
      filterModel.price = JSON.parse(`[${params.filter.price.split('-').join(',')}]`);
    }

    return productStore.filterPagination(filterModel, pagingParams).then(rawPaging => {

      let respProducts = [],
        search = params.filter.search;

      if (search ? search.length > 0 : false) {
        rawPaging.data = ProductBusiness.sort(rawPaging.data, search);
      }

      rawPaging.data.forEach(e => {

        let item = productStore.createModel(e).responseObject({
          schema: productSchema.response
        });

        if (e.productColor.id) {
          item.productColor = productColorStore.createModel(e.productColor).responseObject({
            schema: productColorSchema.responseOne
          });
        }

        respProducts.push(item);

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

  getListHome(request, reply) {
    let productStore = request.dataStore.getStore('Product'),
      productColorStore = request.dataStore.getStore('ProductColor'),
      query = request.common.params,
      listCategoryGroupId = helpers.Data.stringToArray(query.filter.categoryGroupId),
      listPromise = [],
      listPromiseProductPrice = [],
      selectOptions = new optionTypes.SelectOptions(),
      categoryStore = request.dataStore.getStore('Category'),
      categoryGroupStore = request.dataStore.getStore('CategoryGroup');

    selectOptions.limit = query.filter.limit;
    selectOptions.order = '-created_at';
    selectOptions.includes = [productColorStore.tableAlias, categoryStore.tableAlias, categoryGroupStore.tableAlias];

    listCategoryGroupId.forEach(e => {
      listPromise.push(productStore.getManyByCategoryGroup(e, selectOptions));
    });

    selectOptions.limit = query.filter.limitProductRight;
    selectOptions.order = 'base_price';
    listCategoryGroupId.forEach(e => {
      listPromiseProductPrice.push(productStore.getManyByCategoryGroup(e, selectOptions));
    });

    return BPromise.all(listPromise).then(results => {
      let resp = ProductBusiness.replyListProduct(request, results, productSchema, productColorSchema);
      return BPromise.all(listPromiseProductPrice).then(productRight => {

        let respProductRight = ProductBusiness.replyListProduct(request, productRight, productSchema, productColorSchema);
        // for (let i in listCategoryGroupId) {
        //   let count = 0;
        //   for (let y in resp) {
        //     if (listCategoryGroupId[i] === resp[y].categoryGroupId) {
        //       if (count < parseInt(query.filter.limitProductRight)) {
        //         respProductRight.push(resp[y]);
        //         count++;
        //       } else {
        //         break;
        //       }
        //     }
        //   }
        // }
        return reply(helpers.Json.response(request, {
          meta: {
            message: 'Get products list of home successfully'
          },
          data: {
            products: resp,
            productsRight: respProductRight
          }
        }));

      }).catch(err => {
        return helpers.HAPI.replyError(request, reply, err, {
          log: ['errors', 'get list productRight']
        });
      });

    }).catch(err => {
      return helpers.HAPI.replyError(request, reply, err, {
        log: ['errors', err]
      });
    });

  }

  get(request, reply) {
    let productStore = request.dataStore.getStore('Product'),
      urlKey = request.params.urlKey,
      productColorStore = request.dataStore.getStore('ProductColor'),
      productColorPreviewImageStore = request.dataStore.getStore('ProductColorPreviewImage'),
      listProductColorId = [];

    return productStore.getOneProduct(urlKey).then(result => {
      return productColorStore.getManyByProduct(result.id).then(rawProductColor => {
        rawProductColor.forEach(e => {
          listProductColorId.push(e.id);
        });

        let respFunc = (rawProductColorPreviewImage) => {
          let selectOptions = new optionTypes.SelectOptions();
          selectOptions.limit = request.common.params.filter.limit;
          selectOptions.order = '-created_at';

          return productStore.getManyByCategory(result.categoryId, selectOptions).then(rawProducts => {

            let respProduct = productStore.createModel(result).responseObject({
                schema: productSchema.response
              }),
              respProductColor = [];

            rawProductColor.forEach((e, i) => {
              rawProductColor[i] = productColorStore.createModel(e);
              rawProductColorPreviewImage.forEach(a => {
                if (e.id === a.productColorId) {
                  if (!rawProductColor[i].productColorPreviewImages) {
                    rawProductColor[i].productColorPreviewImages = [];
                  }
                  rawProductColor[i].productColorPreviewImages.push(productColorPreviewImageStore.createModel(a).responseObject({
                    schema: productColorPreviewImageSchema.response
                  }));
                }
              });
            });

            rawProductColor.forEach(e => {
              respProductColor.push(e.responseObject({
                schema: productColorSchema.response
              }));
            });



            respProduct.productColors = respProductColor;
            rawProducts.forEach((e, i) => {
              rawProducts[i] = productStore.createModel(e).responseObject({
                schema: productSchema.response
              });
            });

            let responseObject = helpers.Json.response(request, {
              meta: {
                message: 'Get product detail successfully'
              },
              data: {
                product: respProduct,
                products: rawProducts
              }
            });

            return reply(responseObject);

          }).catch(err => {
            return helpers.HAPI.replyError(request, reply, err, {
              log: ['error', 'get products']
            });
          });
        };

        if (listProductColorId.length > 0) {

          return productColorPreviewImageStore.getManyByProductColor(listProductColorId).then(rawProductColorPreviewImage => {
            respFunc(rawProductColorPreviewImage);
          }).catch(err => {
            return helpers.HAPI.replyError(request, reply, err, {
              log: ['error', 'get product color preview']
            });
          });

        }

        return respFunc([]);

      }).catch(err => {
        return helpers.HAPI.replyError(request, reply, err, {
          log: ['error', 'get product color']
        });
      });

    }).catch(err => {
      return helpers.HAPI.replyError(request, reply, err, {
        log: ['error', 'get product']
      });
    });

  }

}

module.exports = new ProductController();