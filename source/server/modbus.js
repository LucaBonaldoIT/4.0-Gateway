/*

    Contains Modbus devices handler

*/

`use strict`;

var jsmodbus = require("jsmodbus");
var opcua = require("node-opcua");
const net = require("net");
const config = require("./config.json");

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database("databases/machine.db", () => {

  let table_definition = 'date TEXT,'

  config.device.parameters.forEach((parameter) => {
    table_definition += parameter.name + ' INTEGER,';
  })

  table_definition = table_definition.slice(0, -1)

  db.run(`CREATE TABLE IF NOT EXISTS machine (${table_definition});`)
})

class Modbus {
  static client;
  static socket;

  static map = {};

  static connect(host, port, unit) {
    Modbus.socket = new net.Socket();

    Modbus.client = new jsmodbus.client.TCP(Modbus.socket, unit, 5000);

    Modbus.socket.connect({
      host: host,
      port: port,
    });
  }

  static async pool() {
    config.device.parameters.forEach(async (parameter) => {
      var value = await Modbus.read(
        parameter.type,
        parameter.address
      );
      Modbus.map[parameter.address] = value == undefined ? 0 : value;
    });
  }

  static async log() {
    db.serialize(() => {
      var values = `"${new Date().toISOString()}",`;
      config.device.parameters.forEach((parameter) => {
        values += String(Modbus.map[parameter.address] == undefined ? 0 : Modbus.map[parameter.address]) + ',';
      })
      values = values.slice(0, -1)
      db.run(`INSERT INTO machine VALUES(${values})`)
    })
  }

  static async read(type, address) {
    switch (type) {
      case "coil":
        let coil = false;
        await Modbus.client.readCoils(address, 1).then((resp) => {
          coil = Boolean(resp.response.body.valuesAsBuffer.at(0));
        });
        return coil;
        break;
      case "discreteinput":
        let discreteinput = false;
        await Modbus.client.readDiscreteInputs(address, 1).then((resp) => {
          discreteinput = Boolean(resp.response.body.valuesAsBuffer.at(0));
        });
        return discreteinput;
        break;
      case "holdingregister":
        let holdingregister = 0;
        await Modbus.client.readHoldingRegisters(address, 1).then((resp) => {
          holdingregister = resp.response.body.valuesAsBuffer.readInt16BE();
        });
        return holdingregister;
        break;
      case "inputregister":
        var int = false;
        await Modbus.client.readInputRegisters(address, 1).then((resp) => {
          int = resp.response.body.valuesAsBuffer.readInt16BE();
        });
        return int;
        break;
    }
  }

  static async write(type, value, address) {
    switch (type) {
      case "holdingregister":
        await Modbus.client.writeSingleRegister(address, value);
        break;
      case "coil":
        await Modbus.client.writeSingleCoil(address, value);
        break;
    }      console.log(Modbus.map);

  }

  static async initialize() {
    Modbus.connect("localhost", 502, 1);

    await Modbus.socket.on("connect", async () => {

      setTimeout(() => {
        setInterval(async () => {
          await Modbus.pool();
          Modbus.log()
        }, 500)
      })
      }, 1000)
  }

}

exports.Modbus = Modbus;