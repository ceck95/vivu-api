const helpers = require('node-helpers');
const vivuCommon = require('vivu-common-api');
const orderSchema = vivuCommon.schemas.order;
const orderItemSchema = vivuCommon.schemas.orderItem;
const productSchema = vivuCommon.schemas.product;
const productColorSchema = vivuCommon.schemas.productColor;
const customerAddressSchema = vivuCommon.schemas.customerAddress;
const orderPaymentSchema = vivuCommon.schemas.orderPayment;
const options = helpers.ttypes.options;
const BaseController = require('node-hapi').Controller;

class OrderController extends BaseController {

  getList(request, reply) {
    let orderStore = request.dataStore.getStore('Order'),
      orderItemStore = request.dataStore.getStore('OrderItem'),
      profile = request.auth.credentials.profile,
      customerAddressStore = request.dataStore.getStore('CustomerAddress'),
      orderPaymentStore = request.dataStore.getStore('OrderPayment'),
      productStore = request.dataStore.getStore('Product'),
      productColorStore = request.dataStore.getStore('ProductColor'),
      selectOptions = new options.SelectOptions();

    selectOptions.includes = [customerAddressStore.tableAlias, orderPaymentStore.tableAlias];
    return orderStore.getManyByCustomer(profile.id, selectOptions).then(orders => {

      let listIds = [];
      orders.forEach(e => {
        listIds.push(e.id);
      });
      console.log(orders);
      selectOptions.includes = [productStore.tableAlias, productColorStore.tableAlias];

      return orderItemStore.getManyByOrder(listIds, selectOptions).then(orderItems => {

        orderItems.forEach((e, i) => {
          orderItems[i] = orderItemStore.createModel(orderItems[i]).responseObject({
            schema: orderItemSchema.responseItem
          });

          orderItems[i].product = productStore.createModel(e.product).responseObject({
            schema: productSchema.responseOneForQuoteItem
          });
          orderItems[i].product.productColor = productColorStore.createModel(e.productColor).responseObject({
            schema: productColorSchema.responseOne
          });

        });


        orders.forEach((e, i) => {
          orders[i] = orderStore.createModel(orders[i]).responseObject({
            schema: orderSchema.responseItem
          });

          orders[i].address = customerAddressStore.createModel(e.address).responseObject({
            schema: customerAddressSchema.response
          });

          orders[i].orderPayment = orderPaymentStore.createModel(e.orderPayment).responseObject({
            schema: orderPaymentSchema.response
          });
          orderItems.forEach(a => {
            if (e.id === a.orderId) {
              if (!orders[i].orderItems) {
                orders[i].orderItems = [];
              }
              orders[i].orderItems.push(a);
            }
          });

        });


        return reply(helpers.Json.response(request, {
          meta: {
            message: 'Get orders successfully'
          },
          data: {
            orders: orders
          }
        }));

      }).catch(err => {
        return helpers.HAPI.replyError(request, reply, err, {
          log: ['errors', 'get order item by order']
        });
      });

    }).catch(err => {
      return helpers.HAPI.replyError(request, reply, err, {
        log: ['errors', 'get order']
      });
    });
  }

}

module.exports = OrderController;