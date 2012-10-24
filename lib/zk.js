
var _ = require('underscore');
var async = require('async');
var zookeeper = require('zookeeper');
var thrift = require('./thrift');


// zookeeper server defaults
var serverConfig = {
  timeout: 1000,
  debug_level: zookeeper.ZOO_LOG_LEVEL_ERROR,
  host_order_deterministic: false
}
var config = {
  verbose: false,
  logger: null 
}

/**
  Optionally override local config settings
*/
module.exports.init = function(serverOptions, options) {
  if (serverOptions) {
    _.extend(serverConfig, serverOptions);
  }
  if (options) {
    _.extend(config, options);
  }
}


function log(level, message) {
  if (config && config.logger) {
    logger[level](message);
  } else if (config && config.verbose) {
    console.log(message);
  }
}


/**
  return connected zookeeper instance;  remember to close when finished
  - server: ZooKeeper server (eg: "http://testhost.com:2181")
*/
module.exports.connect = function(server, callback) {
  if (!server) {
    return callback("zk.connect error:  missing server")
  }
  var conf = _.clone(serverConfig)
  conf.connect = server;

  // create instance and connect
  zook = new zookeeper(conf);
  log('debug','ZK: attempt connect to ' + server);
  return zook.connect(function(err) {
    if (err) return callback(err);
    // return handle to connected instance
    log('debug','ZK: connect successful');
    return callback(null, zook);
  });
}

/**
  Close the instance created by connect
*/
module.exports.close = function(zkInstance) {
  if (zkInstance) {
    process.nextTick(function() {
      log('debug','ZK: close zookeeper connection');
      zkInstance.close();
    });
  }
}

/**
  Get child nodes for given path
  - zkInstance: connected zookeeper instance
  - path: '/path/to/zookeeperService/one'
  Returns
  - ['child1','child2']
*/
function childNodesForPath(zkInstance, path, callback) {
  log('debug', "ZK: attempt childNodes for path " + path);
  return zkInstance.a_get_children(path, true, function(rc, err, children) {
    log('debug', "ZK: childNodes " + rc + " " + err + " " + children);
    if (rc !== 0) {
      return callback("ERROR zk.a_get_children: " + rc + ", error: '" + err + "'");
    } else {
      return callback(null, children);
    }
  });
};


/**
  Get child nodes for set of paths
  - paths: ['/path/to/zookeeperService/one', '/path/to/zookeeperService/two']
  Returns
  {
    '/path/to/zookeeperService/one':['child1','child2','child3'],
    '/path/to/zookeeperService/two':['child1','child2'],
  }
*/
module.exports.childNodes = function(zkInstance, paths, callback) {
  if (!zkInstance) {
    return callback("childNodes: missing instance")
  } else if (!paths || paths.length < 1) {
    return callback(null, {})
  }
  
  var batched = {};
  _.each(paths, function(path) {
    batched[path] = function(cb) { childNodesForPath(zkInstance, path, cb)}
  })
  async.parallel(batched, callback);
}


/**
  Read zookeeper node
  - zkInstance: connected zookeeper instance
  - path: '/path/to/zookeeperService/one'
*/
module.exports.readNode = function(zkInstance, path, callback) {
  return zkInstance.a_get(path, true, function(rc, err, stat, value) {
    if (rc !== 0) {
      return callback("ZK: read error for path " + path + ": code=" + rc + ", err='" + err + "', stat=" + stat);
    } else if (value === null) {
      return callback("ZK: read error for path " + path + ": missing value");
    } else {
      return callback(null, value);
    }
  });
};

