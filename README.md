node-zookeeper-thrift
=====================

Provide functionality that can traverse the ZooKeeper hierarchy and read/deserialize thrift-encoded nodes for Node.JS

Usage
=====

    var zkt = require('node-zookeeper-thrift');

    var server = "yourZookeeperServer.com:2181";

    // see zookeeper-thrift/lib/thrift.js for instructions on how to generate thriftClient for your schema
    var thriftClient = require('./config/thrift/gen-nodejs/GENERATED_OUTPUT').YOUR_CLASS_NAME;

    // associate paths in zookeeper schema to (optional) thrift clients for deserialization
    var schema = {
      "/path/to/service/one": {thriftClient: thriftClient},
      "/path/to/service/two": {thriftClient: thriftClient}
    }

    // fetch (read and deserialize) all the child nodes of provided schema paths
    zkt.fetch(server, schema, function(err, results) {
      if (err) {
        console.log("ERROR: ", err);
      } else {
        console.log("RESULT: ", results);
      }
    })
