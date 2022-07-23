/*

    Modbus to OPC-UA server

*/

`use strict`;

var modbusjs = require("jsmodbus");
var opcua = require("node-opcua");
var modbus = require("./modbus")
var config = require("./config.json")

// Todo - Add Modbus to OPC-UA implementation

class Server {
    static OPCUAServer = null;

    static async initialize() {
        Server.OPCUAServer = new opcua.OPCUAServer({
            port: config.port,
            resourcePath: config.url
        });
        await Server.OPCUAServer.initialize(() => {
            console.log("Server initialized")
        });
        await Server.OPCUAServer.start(() => {
            console.log("Server started")
        })
    }

}

// (async () => {await Server.initialize();})
