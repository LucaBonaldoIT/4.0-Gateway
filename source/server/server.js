/*

    Modbus to OPC-UA server

*/

`use strict`;

var modbusjs = require("jsmodbus");
var opcua = require("node-opcua");
var modbus = require("./modbus");
var config = require("./config.json");

class Server {
  static OPCUAServer = null;

  static create_modbus_variables(
    modbus,
    root_name,
    register,
    type,
    address,
    count,
    device
  ) {
    var start_address = address;

    if (device.onebased && address > 0) {
      start_address = address - 1;
    } else if (address == 0) {
      return;
    } else if (address < 0) {
      return;
    }
    modbus.StartPoll(root_name, type, start_address, count, device.pollrate);
    for (var i = 0; i < count; i++) {
      var node = (function (register, type, address, i) {
        var server_node = {
          componentOf: register,
          browseName: (address + i).toString(),
          minimumSamplingInterval: device.pollrate,
          dataType: modbus.GetDataTypeString(type),
          value: {
            get: function () {
              return modbus.ReadValue(
                root_name + (start_address + i).toString()
              );
            },
            set: function (variant) {
              modbus.WriteValue(type, start_address + i, variant);
              return opcua.StatusCodes.Good;
            },
          },
        };
        return server_node;
      })(register, type, address, i);
      Server.OPCUAServer.engine.addressSpace.addVariable(node);
    }
  }

  static construct_address_space() {
    var devices_node = Server.OPCUAServer.engine.addressSpace.addFolder(
      "RootFolder",
      { browseName: "HMI" }
    );

    config.devices.forEach(function (device) {
      modbus.CreateModbusDevice(device.host, device.port, device.unit);
      var device_node_full_name =
        device.host + ":" + device.port + " unit: " + device.unit;
      var device_node = Server.OPCUAServer.engine.addressSpace.addFolder(
        devices_node,
        { browseName: device_node_full_name }
      );
      device.parameters.forEach(function (parameter) {
        var parameter_type = Server.OPCUAServer.engine.addressSpace.addFolder(
          device_node,
          { browseName: parameter.type }
        );
        parameter.addresses.forEach(function (address_info) {
          create_modbus_variables(
            modbus,
            device_node.browseName + parameter_type.browseName,
            parameter_type,
            parameter.type,
            address_info.address,
            address_info.count,
            device
          );
        });
      });
    });
  }

  static async initialize() {

    Server.OPCUAServer = new opcua.OPCUAServer({
      port: config.port,
      resourcePath: config.url,
    });

    Server.OPCUAServer.buildInfo.productName = "HMI-OPC-UA-SERVER";
    Server.OPCUAServer.buildInfo.buildNumber = "1";
    Server.OPCUAServer.buildInfo.buildDate = new Date();

    await Server.OPCUAServer.initialize(() => {
      Server.construct_address_space();
    });

    await Server.OPCUAServer.start(() => {
      console.log("Server started");
    });
  }
}

// (async () => {await Server.initialize();})
