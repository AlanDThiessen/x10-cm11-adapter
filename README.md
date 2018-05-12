# x10-cm11-adapter
A Mozilla IoT adapter for controlling X10 devices through a CM11 serial interface.

## About
This project is an add-on to the [Mozilla IoT Gateway](https://iot.mozilla.org/gateway/).  It enables users to control [X10 Devices](https://www.x10.com/) through the [CM11](http://kbase.x10.com/wiki/CM11A) serial interface.

## Installation
As this is a plugin for the [Mozilla IoT Gateway](https://iot.mozilla.org/gateway/), please first read their instructions for setting up a gateway.

1. In the Mozilla IoT gateway, select *Menu -> Settings -> Add-ons*.
2. Click the `+` (plus) button to install an add-on.
3. Find *X10-CM11* in the list and click the `+ Add` button.

## Configuration
Before using this addon, X10 modules need to be added to the configuration.

To configure the X10-CM11 Adapter:
1. In the Mozilla IoT gateway, select *Menu -> Settings -> Add-ons*.
2. Find "x10-cm11-adapter" and click the * Configure * button.

### Options

#### Device Serial Port
In order to communicate with the CM11 interface, the adapter needs to know which serial port to use.  Default: `/dev/ttyUSB0`.

#### X10 Modules
This configuration option allows the user to specify all of the X10 modules they desire to control.

1. Click the `+` button to add an X10 module.
2. Select the House Code assigned to the module (A-P).
3. Select the Unit Code assigned to the module (1-16).
4. Select the module type.  Options include: 
   * *Lamp Module* - A dimmable light.
   * *Appliance Module* - An on/off light or device (non-dimmable).
   * *On/Off Switch* - A non-dimmable switch.
   * *Dimmer Switch* - A dimmer switch.
   * *On/Off Sensor* - A sensor which sends signals of on and off to X10 codes.
5. Repeat for each module.

After adding the modules, return to the *Things* menu and click the `+` button to add the defined modules to the list of controllable Things.
