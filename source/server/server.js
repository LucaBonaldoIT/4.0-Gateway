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
      Server.OPCUAServer.engine.addressSpace.getOwnNamespace().addVariable(node)
    }
  }

  static construct_address_space() {
    var address_space = Server.OPCUAServer.engine.addressSpace
    var namespace = address_space.getOwnNamespace()

    var device_namespace = namespace.addObject({
        organizedBy: address_space.rootFolder.objects,
        browseName: "HMI"
    })

    config.devices.forEach(function (device) {
      modbus.CreateModbusDevice(device.host, device.port, device.unit);

      var device_node_full_name =
        device.host + ":" + device.port + " unit: " + device.unit;

      var device_node = namespace.addObject({
        organizedBy: device_namespace,
        browseName: device_node_full_name
      })

      device.parameters.forEach(function (parameter) {
        var parameter_type = namespace.addObject({
            organizedBy: device_node,
            browseName: parameter.type
        });
        parameter.addresses.forEach(function (address_info) {
          Server.create_modbus_variables(
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
      buildInfo: {
        productName: "HMI-OPC-UA-SERVER",
        buildNumber: "1",
        buildDate: new Date()
      }
    });

    await Server.OPCUAServer.initialize(() => {
      Server.construct_address_space();
    });

    await Server.OPCUAServer.start(() => {
      console.log("Server started");
    });
  }
}

(async () => {
    Server.initialize()
})();