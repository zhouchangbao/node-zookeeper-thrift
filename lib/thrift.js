/**

This is a bit of a hack if/until thrift exports access to inner transport and protocol
classes.

*/
var thriftModuleDir = '../node_modules/thrift/lib/thrift'
TFramedTransport = require(thriftModuleDir + '/transport').TFramedTransport; 
TBinaryProtocol = require(thriftModuleDir + '/protocol').TBinaryProtocol;


/**
  Decode thriftEncodedData given thriftClientClass

  Generate thriftClientClass via the following steps:

  1.  acquire thrift template specification files from who ever built it (eg: EXAMPLE_SCHEMA.thrift)

  2.  Install thrift on local machine (ie, via "brew install thrift")

  3.  generate thrift clients for nodejs using template specification files
      thrift --gen js:node schema/EXAMPLE_SCHEMA.thrift

      This creates creates gen-node.js directory containing GENERATED_OUTPUT.js

  4.  Inside GENERATED_OUTPUT.js is a class you will want to instanciate.  Find this class name and plug 
      it into the example code below  (ie, "YOUR_CLASS_NAME")

      thriftClientClass = require('../config/thrift/gen-nodejs/GENERATED_OUTPUT').YOUR_CLASS_NAME;

*/
module.exports.parseThrift = function(thriftClientClass, thriftEncodedData, callback) {
  try {
    var transport = new TFramedTransport(thriftEncodedData);
    var protocol  = new TBinaryProtocol(transport);
    var client = new thriftClientClass();
    client.read(protocol);
    callback(null, client);
  } catch(e) {
    callback(e);
  }
}
