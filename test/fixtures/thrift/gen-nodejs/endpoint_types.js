//
// Autogenerated by Thrift Compiler (0.8.0)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//
var Thrift = require('thrift').Thrift;
var ttypes = module.exports = {};
ttypes.Status = {
'DEAD' : 0,
'STARTING' : 1,
'ALIVE' : 2,
'STOPPING' : 3,
'STOPPED' : 4,
'WARNING' : 5
};
var Endpoint = module.exports.Endpoint = function(args) {
  this.host = null;
  this.port = null;
  if (args) {
    if (args.host !== undefined) {
      this.host = args.host;
    }
    if (args.port !== undefined) {
      this.port = args.port;
    }
  }
};


Endpoint.prototype = {};
Endpoint.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.STRING) {
        this.host = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.I32) {
        this.port = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

module.exports.read = Endpoint.prototype.read;

Endpoint.prototype.write = function(output) {
  output.writeStructBegin('Endpoint');
  if (this.host) {
    output.writeFieldBegin('host', Thrift.Type.STRING, 1);
    output.writeString(this.host);
    output.writeFieldEnd();
  }
  if (this.port) {
    output.writeFieldBegin('port', Thrift.Type.I32, 2);
    output.writeI32(this.port);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var ServiceInstance = module.exports.ServiceInstance = function(args) {
  this.serviceEndpoint = null;
  this.additionalEndpoints = null;
  this.status = null;
  if (args) {
    if (args.serviceEndpoint !== undefined) {
      this.serviceEndpoint = args.serviceEndpoint;
    }
    if (args.additionalEndpoints !== undefined) {
      this.additionalEndpoints = args.additionalEndpoints;
    }
    if (args.status !== undefined) {
      this.status = args.status;
    }
  }
};
ServiceInstance.prototype = {};
ServiceInstance.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.STRUCT) {
        this.serviceEndpoint = new ttypes.Endpoint();
        this.serviceEndpoint.read(input);
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.MAP) {
        var _size0 = 0;
        var _rtmp34;
        this.additionalEndpoints = {};
        var _ktype1 = 0;
        var _vtype2 = 0;
        _rtmp34 = input.readMapBegin();
        _ktype1 = _rtmp34.ktype;
        _vtype2 = _rtmp34.vtype;
        _size0 = _rtmp34.size;
        for (var _i5 = 0; _i5 < _size0; ++_i5)
        {
          if (_i5 > 0 ) {
            if (input.rstack.length > input.rpos[input.rpos.length -1] + 1) {
              input.rstack.pop();
            }
          }
          var key6 = null;
          var val7 = null;
          key6 = input.readString();
          val7 = new ttypes.Endpoint();
          val7.read(input);
          this.additionalEndpoints[key6] = val7;
        }
        input.readMapEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.I32) {
        this.status = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

ServiceInstance.prototype.write = function(output) {
  output.writeStructBegin('ServiceInstance');
  if (this.serviceEndpoint) {
    output.writeFieldBegin('serviceEndpoint', Thrift.Type.STRUCT, 1);
    this.serviceEndpoint.write(output);
    output.writeFieldEnd();
  }
  if (this.additionalEndpoints) {
    output.writeFieldBegin('additionalEndpoints', Thrift.Type.MAP, 2);
    output.writeMapBegin(Thrift.Type.STRING, Thrift.Type.STRUCT, Thrift.objectLength(this.additionalEndpoints));
    for (var kiter8 in this.additionalEndpoints)
    {
      if (this.additionalEndpoints.hasOwnProperty(kiter8))
      {
        var viter9 = this.additionalEndpoints[kiter8];
        output.writeString(kiter8);
        viter9.write(output);
      }
    }
    output.writeMapEnd();
    output.writeFieldEnd();
  }
  if (this.status) {
    output.writeFieldBegin('status', Thrift.Type.I32, 3);
    output.writeI32(this.status);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

