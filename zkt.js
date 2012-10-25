var zk = require('./lib/zk');
var _ = require('underscore');
var async = require('async');
var thrift = require('./lib/thrift');


module.exports.thrift = thrift;

/**
 Return data in a format we want.

 - childNodes is a hash of path-to-array mappings
 - data is a hash of full paths to actual data

*/
function format(childNodes, data, callback) {
  var result = {};
  _.each(childNodes, function(children, path) {
    result[path] = {};
    _.each(children, function(child) {
      fullPath = path + '/' + child;
      result[path][child] = data[path + '/' + child]
    })
  });
  callback(null, result);
}


/**
  Return handle to a function that will read the zookeeper node for given path, 
  deserialize it if thriftClient available, and futher format the result if formatter
  function
*/
function readFn(zkInstance, fullPath, thriftClient, formatter) {
  var fn = function(cb) {
    zk.readNode(zkInstance, fullPath, function(err, value) {
      if (err) return cb(err);
      if (!thriftClient) return cb(null, value);

      // if thrift client available, parse data
      thrift.parseThrift(thriftClient, value, function(err, data) {
        // if formatter, available, additionally format the data
        if (formatter && !err && data) {
          data = formatter(data);
        }
        return cb(err, data);
      });
    });
  }
  return fn;
}

/**
  Read each child node.  Deserialize if thrift client available.
*/
function read(zkInstance, childNodes, schema, callback){
  // step through each path+childNode
  var batched = {};
  var fullPath, thriftClient;
  _.each(childNodes, function(children, path) {
    _.each(children, function(child) {

      fullPath = path + '/' + child;
      thriftClient = (schema && schema[path] && schema[path].thriftClient) ? 
        schema[path].thriftClient : null;
      formatter = (schema && schema[path] && schema[path].formatter) ? 
        schema[path].formatter : null;

      // for each child node, create function that will read it
      batched[fullPath] = readFn(zkInstance, fullPath, thriftClient, formatter);

    })
  });

  // read nodes in parallel
  async.parallel(batched, function(err, results) {
    format(childNodes, results, callback);
  });
}


/**
  Optionally override default options
  - serverOptions
    - timeout: 1000,
    - debug_level: zookeeper.ZOO_LOG_LEVEL_ERROR,
    - host_order_deterministic: false
  - options
    - verbose: 
    - logger: 
*/
module.exports.init = function(serverOptions, options) {
  zk.init(serverOptions, options)
}


/**
  Fetch data given server and schema
  - server: "testserver.com:2181"
  - schema: {
      '/path/to/zookeeperService/one': {
          thriftClient: <point-to-generated-thrift-client-class>,
          formatter: function(data) { return(formatted-data)}
      },
      '/path/to/zookeeperService/two': {thriftClient: <point-to-generated-thrift-client-class>}
  }

  Returns:
  {
    '/path/to/zookeeperService/one': {
      "childNode1":'data',
      "childNode2":'data',
    }
    '/path/to/zookeeperService/two': {
      "childNode1":'data'
    }
  }
*/
module.exports.fetch = function(server, schema, callback) {
  var stash = {}; // we need a place to stash our results
  var funcs = {};   // collect the functions we will run in series

  // connect to our server;  hold on to instance handle
  funcs.connect = function(cb) {
    zk.connect(server, function(err, instance) {
      if (!err) { stash.zkInstance = instance; }
      return cb(err, instance);
    })
  };

  // read zookeeper servicePaths for available child nodes; stashed in stash.childNodes
  funcs.childNodes = function(cb) {
    var servicePaths = _.keys(schema);
    zk.childNodes(stash.zkInstance, servicePaths, function(err, nodes) {
      if (!err) { stash.childNodes = nodes }
      return cb(err, nodes);
    })
  };

  // read data stored at each node
  funcs.readNodes = function(cb) {
    read(stash.zkInstance, stash.childNodes, schema, cb)
  };

  // now run functions in series!
  async.series(funcs, function(err, results) {
    zk.close(stash.zkInstance); // close our connection
    if (err) {
      return callback(err);
    }
    // pass back the results from the readNodes function
    return callback(null, results.readNodes);
  })
}