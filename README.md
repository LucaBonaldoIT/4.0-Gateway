# 4.0 Gateway
## Introduction
Industry 4.0 Gateway is a project that aims to enable old machine to comply with Industry 4.0 standards. The software in the repository is designed to run on a Raspberry 4, and the like, connected to the HMI panel that does not support Industry 4.0 standards. The latter will have to allow communication via Modbus TCP/IP, so that the Raspberry can interface with it.

## Key Points
**The key points of the project will be explained below.**
#### - OPC-UA
The gateway will also work as a Modbus TCP/IP to OPC-UA server, as required by Industry 4.0 standards. 
#### - Bidirectionality Of Data
Data must be able to be received by the machine and sent to it. Thus allowing system logs to be saved on an external server, as well as recipes to be entered remotely, as required by Industry 4.0 standards.
#### - Real-time Data 
The data must be accessible in real time via a web server, as required by Industry 4.0 standards.
#### - Data Logger
The system will be equipped with a data logger with a programmable cadence of 20, 30 or 60 seconds, as required by Industry 4.0 standards.
#### - CSV Format Support
It will be possible to read recipes in CSV format, as well as download CSV-formatted logs to a network folder or USB stick, so they can be quickly extrapolated, as required by Industry 4.0 standards.

## Hardware
The project is designed to run on a Raspberry, in this case model 4, but this does not prevent its adaptation to other hardware systems. Supplementing it will also require the appropriate wiring for communication with the HMI, and possibly conversion shields. Any modifications will be indicated in the course of the work. 

## Software
The programming language used will be primarily Python and/or JavaScript, with possible exceptions. The idea of using a more robust language such as C++ or Java has also been considered, and it remains a possible option, although currently discarded due to higher production costs.

Among the libraries that are likely to be used are Flask for creating the web app, a need made explicit earlier; as well as the logging module and others.
