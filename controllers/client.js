/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2016-11-09T09:25:53+07:00
 * @Email:  tranvannhut4495@gmail.com
 * @Last modified by:   root
 * @Last modified time: 2017-03-08T16:19:08+07:00
 */



'use strict';

const helpers = require('node-helpers');
const clientSchema = require('../schemas/client');

class ClientController {

  insertClient(request, reply) {

    let clientStore = request.dataStore.getStore('ClientId'),
      form = request.payload.data;

    return clientStore.insertOne(clientStore.createModel(form).toThriftInsert()).then(result => {

      let responseObject = helpers.Json.response(request, {
        meta: {
          message: 'Insert client id successfully'
        },
        data: {
          client: clientStore.createModel(result).responseObject({
            schema: clientSchema.response
          })
        }
      });

      return reply(responseObject);

    }).catch(err => {

      return helpers.HAPI.replyError(request, reply, err, {
        log: ['error', 'insert', 'client']
      });

    });
  }

}

module.exports = new ClientController();