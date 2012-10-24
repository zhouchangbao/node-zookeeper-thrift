var thrift = require('../../lib/thrift');
var should = require('should');
var fs = require('fs');

var encodedData = fs.readFileSync(__dirname + '/../fixtures/sampleThriftEncodedData');
var thriftClientClass = require('../fixtures/thrift/gen-nodejs/endpoint_types').ServiceInstance;


describe('thrift', function() {

  it('should deserialize thrift-encoded-data', function() {
    thrift.parseThrift(thriftClientClass, encodedData, function(err, data) {
      if (err) {
        throw err;
      }
      data.serviceEndpoint.host.should.equal('10.100.145.81');
      data.serviceEndpoint.port.should.equal(4567)
    })
  });

  it('should fail if invalid class', function() {
    thrift.parseThrift(null, encodedData, function(err, data) {
      errMsg = err.stack.split('\n')[0]
      errMsg.should.equal('TypeError: object is not a function')
    })
  })

  it('should fail if invalid data', function() {
    thrift.parseThrift(thriftClientClass, "foo", function(err, data) {
      errMsg = err.stack.split('\n')[0];
      errMsg.should.equal("TypeError: Cannot read property 'stack' of null");
    })
  })
})