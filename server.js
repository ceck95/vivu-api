/**
 * @Author: Tran Van Nhut <nhutdev>
 * @Date:   2017-02-10T09:43:51+07:00
 * @Email:  tranvannhut4495@gmail.com
* @Last modified by:   nhutdev
* @Last modified time: 2017-02-10T09:44:08+07:00
 */



'use strict';

const vivuCommon = require('vivu-common-api');
const NodeServer = require('node-hapi').Server;

let nodeServer = new NodeServer(vivuCommon);

nodeServer.run();
