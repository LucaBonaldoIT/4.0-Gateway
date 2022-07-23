/*

    Contains Modbus devices handler

*/

`use strict`;

var jsmodbus = require("jsmodbus");
var opcua = require("node-opcua");

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
    this.client.on("error", () => {
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
    var modbus_client = modbus.client.tcp.complete({
      host: host,
      port: port,
      autoReconnect: true,
      reconnectTimeout: 1000,
      timeout: 5000,
      unitId: unit,
    });
    modbus_client.connect();
    this.client = modbus_client;
  },
};

function polldata(client, value_map, root_name, type, address, count) {
  switch (type) {
    case "holdingregister":
      client.readHoldingRegisters(address, count).then(function (resp) {
        resp.register.forEach(function (value, i) {
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
        resp.register.forEach(function (value, i) {
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
       resp.coils.forEach(function (value, i) {
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

    case "discreteinputs":
      client.readDiscreteInputs(address, count).then(function (resp) {
        resp.coils.forEach(function (value, i) {
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
