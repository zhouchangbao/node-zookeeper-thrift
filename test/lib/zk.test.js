var zk = require('../../lib/zk');
var zookeeper = require('zookeeper');
var should = require('should');
var sinon = require('sinon');
var fs = require('fs');

var encodedData = fs.readFileSync(__dirname + '/../fixtures/sampleThriftEncodedData');
var thriftClient = require(__dirname + '/../fixtures/thrift/gen-nodejs/endpoint_types').ServiceInstance;

var zkInstanceStub, zkLibStub;


describe('connect', function() {

  beforeEach(function() {
    zk.init();
  });
  afterEach(function() {
    if (zkInstanceStub) {
      zkInstanceStub.restore();
    }
  });

  it('should fail connect if missing server', function() {
    zk.connect(null, function(err, z) {
      err.should.equal('zk.connect error:  missing server')
    });
  });

  it('should connect', function() {
    // stub connect to simulate success
    zkInstanceStub = sinon.stub(zookeeper.prototype, "connect", function(cb) {
      console.log('stubbed connect')
      return cb();
    });

    zk.connect("testserver.com:1234", function(err, z) {
      if (err) {
        throw err;
      }
      should.exist(z);
    });
  });

  it('should report connect error', function() {
    // stub connect to return error
    zkInstanceStub = sinon.stub(zookeeper.prototype, "connect", function(cb) {
      return cb("stubbed error");
    });
    zkInstanceStub.close = function() {};

    zk.connect("testserver.com:1234", function(err, z) {
      err.should.equal("stubbed error");
    });
  });

});


describe('child nodes', function() {

  beforeEach(function() {
    zkInstanceStub = sinon.stub(zookeeper.prototype, "connect", function(cb) {
      console.log('stubbed connect')
      return cb();
    });
  });
  afterEach(function() {
    zkInstanceStub.restore();
  });

  it('should handle get children error', function() {
    zkInstanceStub.a_get_children = function(path, watch, cb) {
      return cb(-1, "stubbed get_children error");
    };
    var paths = ['/path/to/zookeeperService/one', '/path/to/zookeeperService/two'];
    zk.childNodes(zkInstanceStub, paths, function(err, results) {
      return err.should.equal("ERROR zk.a_get_children: -1, error: 'stubbed get_children error'");
    });
  });

  it('should return child nodes', function() {
    zkInstanceStub.a_get_children = function(path, watch, cb) {
      return cb(0, null, ["a", "b", "c"]);
    };
    var paths = ['/path/to/zookeeperService/one'];
    zk.childNodes(zkInstanceStub, paths, function(err, result) {
      if (err) {
        throw err;
      }
      result['/path/to/zookeeperService/one'].should.eql(["a", "b", "c"]);
    });
  });

});



describe('read', function() {

  beforeEach(function() {
    zkInstanceStub = sinon.stub(zookeeper.prototype, "connect", function(cb) {
      console.log('stubbed connect')
      return cb();
    });
  });
  afterEach(function() {
    zkInstanceStub.restore();
  });

  it('should handle get error', function() {
    zkInstanceStub.a_get = function(path, watch, cb) {
      return cb(-1, "stubbed a_get error", "huh?");
    };
    var path = '/path/to/zookeeperService/one/childNode';
    zk.readNode(zkInstanceStub, path, function(err, results) {
      err.should.equal("ZK: read error for path " + path + ": code=-1, err='stubbed a_get error', stat=huh?");
    });
  });

  it('should read node', function() {
    zkInstanceStub.a_get = function(path, watch, cb) {
      return cb(0, null, null, "test data");
    };
    var path = '/path/to/zookeeperService/one/childNode';
    zk.readNode(zkInstanceStub, path, function(err, data) {
      if (err) {
        throw err;
      }
      data.should.equal("test data");
    });
  });

});

