#!/usr/bin/env node
var interfaceSSL          = require('../interfaceSSL');
var https           = require('https');
var ssl             = require('../security/ssl');
var node_env        = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
var portConfig      = require('../config/portConfig.json')[node_env];
var fs               =require('fs');

//启动https的服务
https.createServer(ssl,interfaceSSL).listen(portConfig["SSL"],function(){
    //var myLogger=contextLogger("https");
    console.log('Express webSSL server listening on port '+portConfig["SSL"]);
});
