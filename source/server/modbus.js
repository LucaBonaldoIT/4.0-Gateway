/*

    Contains Modbus devices handler

*/

`use strict`;

var jsmodbus = require("jsmodbus");
var opcua = require("node-opcua");
const net = require("net")

var modbus = {
  client: {},
  value_map: {},
  GetDataTypeString: function (type) {
    switch (type) {
      case "holdingregister":
      case "inputregisters":
        return "Int32";
      case "coils":
      case "discreteinputs":
        return "Boolean";
    }
  },
  GetDataTypeVarInt: function (type) {
    switch (type) {
      case "holdingregister":
      case "inputregisters":
        return opcua.DataType.Int32;
      case "coils":
      case "discreteinputs":
        return opcua.DataType.Int16.Boolean;
    }
  },
  StartPoll: function (name, type, address, count, pollrate) {
    this.socket.on("error", () => {
      for (var property in this.value_map) {
        if (this.value_map.hasOwnProperty(property)) {
          this.value_map[property].q = "bad";
        }
      }
    });
    setInterval(
      polldata.bind(
        null,
        this.client,
        this.value_map,
        name,
        type,
        address,
        count
      ),
      pollrate
    );
  },
  ReadValue: function (name) {
    var val = this.value_map[name];
    if (!val) {
      return opcua.StatusCodes.BadDataUnavailable;
    }
    if (val.q != "good") {
      return opcua.StatusCodes.BadConnectionRejected;
    }
    return val.v;
  },
  WriteValue: function (type, address, variant) {
    switch (type) {
      case "holdingregister":
        var value = parseInt(variant.value);
        this.client.writeSingleRegister(address, value);
        break;
      case "coils":
        var value = variant.value === "true";
        this.client.writeSingleCoil(address, value);
        break;
    }
  },
  CreateModbusDevice: function (host, port, unit) {

    const socket = new net.Socket()

    var modbus_client = new jsmodbus.client.TCP(socket, unit, 5000)

    /*
    jsmodbus.client.TCP.complete({
      host: host,
      port: port,
      autoReconnect: true,
      reconnectTimeout: 1000,
      timeout: 5000,
      unitId: unit,
    });
    */

    socket.connect({
        host: host,
        port: port,
    })

    this.client = modbus_client;
    this.socket = socket;
},
};

function polldata(client, value_map, root_name, type, address, count) {
  console.log(value_map)
  switch (type) {
    case "holdingregister":
      client.readHoldingRegisters(address, count).then(function (resp) {
        resp.response.body.values.forEach(function (value, i) {
          var full_address = (address + i).toString();
          value_map[root_name + full_address] = {
            v: new opcua.Variant({
              dataType: opcua.DataType.Int32,
              value: value,
            }),
            q: "good",
          };
        });
      });
      break;

    case "inputregisters":
      client.readInputRegisters(address, count).then(function (resp) {
        console.log(resp)
        resp.response.body.values.forEach(function (value, i) {
          var full_address = (address + i).toString();
          value_map[root_name + full_address] = {
            v: new opcua.Variant({
              dataType: opcua.DataType.Int32,
              value: value,
            }),
            q: "good",
          };
        });
      });
      break;

    case "coils":
      client.readCoils(address, count).then(function (resp) {
        resp.response.body.values.forEach(function (value, i) {
          var full_address = (address + i).toString();
          value_map[root_name + full_address] = {
            v: new opcua.Variant({
              dataType: opcua.DataType.Int32,//Boolean,
              value: value,
            }),
            q: "good",
          };
        });
      });
      break;

    case "discreteinputs":
      client.readDiscreteInputs(address, count).then(function (resp) {
        resp.response.body.valuesAsArray.forEach(function (value, i) {
          var full_address = (address + i).toString();
          value_map[root_name + full_address] = {
            v: new opcua.Variant({
              dataType: opcua.DataType.Boolean,
              value: value,
            }),
            q: "good",
          };
        });
      });
      break;
  }
}

module.exports = modbus;
