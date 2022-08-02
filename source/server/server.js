/*

    Modbus to OPC-UA server

*/

`use strict`;

var modbusjs = require("jsmodbus");
var opcua = require("node-opcua");
var Modbus = require("./modbus").Modbus;
var config = require("./config.json");

class Server {
  static OPCUAServer = null;

  static construct_address_space() {
    var address_space = Server.OPCUAServer.engine.addressSpace
    var namespace = address_space.getOwnNamespace()

    let device_namespace = namespace.addObject({
        organizedBy: address_space.rootFolder.objects,
        browseName: "HMI"
    })

    config.device.parameters.forEach(function (parameter) {

      var parameter_node = {
        componentOf: device_namespace,
        browseName: parameter.name,
        minimumSamplingInterval: config.device.pollrate,
        dataType: opcua.DataType.Int16,
        value: {
          get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Int16, value: Modbus.map[parameter.address]})
          },
          set: function (variant) {
            Modbus.write(parameter.type, variant.value[0], parameter.address);
            return opcua.StatusCodes.Good;
          },
        },
      };

      Server.OPCUAServer.engine.addressSpace.getOwnNamespace().addVariable(parameter_node)

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
    await Modbus.initialize()
    setTimeout(() => {    Server.initialize()
    }, 2000)
})();