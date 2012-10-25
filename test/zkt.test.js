var zkt = require('../zkt');
var should = require('should');
var sinon = require('sinon');
var zookeeper = require('zookeeper');
var zk = require('../lib/zk');
var fs = require('fs');
var _ = require('underscore');

var stubs = [];
var encodedData = fs.readFileSync(__dirname + '/fixtures/sampleThriftEncodedData');

var server = "testserver.com:2181";
var thriftClient = require(__dirname + '/fixtures/thrift/gen-nodejs/endpoint_types').ServiceInstance;
var schema = {
  "/path/to/service/one": {thriftClient: thriftClient},
  "/path/to/service/two": {thriftClient: thriftClient}
}


describe('fetch', function() {

  beforeEach(function() {
    // stub out connect
    stubs.push(
      sinon.stub(zk, "connect", function(server, cb) {
        //console.log('stubbed connect')
        return cb(null, "stubbed zk instance");
      })
    );
    // stub out close
    stubs.push(
      sinon.stub(zk, "close", function() {
        //console.log('stubbed close');
      })
    );
    // stub out child nodes
    stubs.push(
      sinon.stub(zk, "childNodes", function(zkInstance, paths, cb) {
        //console.log('stubbed childNodes');
        var result = {};
        paths.forEach(function(p) {
          result[p] = ['child1', 'child2']
        })
        return cb(null, result);
      })
    );
    // stub out readNode to return thrift-encoded data
    stubs.push(
      sinon.stub(zk, "readNode", function(zkInstance, path, cb) {
        //console.log('stubbed read');
        return cb(null, encodedData);
      })
    );
  });

  afterEach(function() {
    stubs.forEach(function(s) {
      s.restore();
    })
  });


  it('should fetch schema paths from server', function() {
    zkt.fetch(server, schema, function(err, results) {
      if (err) {
        throw err;
      }
      _.isEqual( _.keys(results), 
                [ '/path/to/service/one', '/path/to/service/two' ]).should.be.true
     
      var child1 = results['/path/to/service/one']['child1'];
      child1.serviceEndpoint.host.should.equal("10.100.145.81");
      child1.serviceEndpoint.port.should.equal(4567);
    });
  });

  it('should fetch schema paths from server and format', function() {
    // create formatter function
    var formatterFn = function(data) {
      if (data && data.serviceEndpoint) {
        return data.serviceEndpoint;
      }
      return data;
    }
    // associate thrift client and formatter with path
    var anotherSchema = {
      "/path/to/service/one": {thriftClient: thriftClient, formatter:formatterFn}
    }

    zkt.fetch(server, anotherSchema, function(err, results) {
      if (err) {
        throw err;
      }
      _.isEqual( _.keys(results), [ '/path/to/service/one' ]).should.be.true
     
      var child1 = results['/path/to/service/one']['child1'];
      child1.host.should.equal("10.100.145.81");
      child1.port.should.equal(4567);
    });
  });

});

