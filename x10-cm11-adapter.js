/******************************************************************************
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 Alan Thiessen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 ******************************************************************************/

'use strict';


const {
    Action,     // Action base class
    Adapter,    // Adapter base class
    Constants,  // Constants used throughout the package
    Database,   // Class for interacting with the gateway's settings database
    Deferred,   // Wrapper for a promise, primarily used internally
    Device,     // Device base class
    Event,      // Event base class
    Property,   // Property base class
    Utils,      // Utility functions
} = require('gateway-addon');

const CM11A = require('cm11a-js');



function on() {
    return {
        name: 'on',
        value: 'false',
        metadata: {
            type: 'boolean'
        }
    }
}


function level() {
    return {
        name: 'level',
        value: 100,
        metadata: {
            type: 'number',
            unit: 'percent'
        }
    }
}


const x10LampModule = {
    name: 'Lamp Module',
    type: 'dimmableLight',
    properties: [
        on(),
        level()
    ]
};


const x10ApplianceModule = {
    name: 'Appliance Module',
    type: 'onOffLight',
    properties: [
        on()
    ]
};


const x10OnOffSwitch = {
    name: 'On/Off Switch',
    type: 'onOffSwitch',
    properties: [
        on()
    ]
};


const x10DimmerSwitch = {
    name: 'Lamp Module',
    type: 'multiLevelSwitch',
    properties: [
        on(),
        level()
    ]
};


const x10OnOffSensor = {
    name: 'On/Off Sensor',
    type: 'binarySensor',
    properties: [
        on()
    ]
};



const X10_DEVICE_TYPES = {
    'Lamp Module': x10LampModule,
    'Appliance Module': x10ApplianceModule,
    'On/Off Switch': x10OnOffSwitch,
    'Dimmer Switch': x10DimmerSwitch,
    'On/Off Sensor': x10OnOffSensor
};


class X10Property extends Property {
    constructor(device, name, descr, value) {
        super(device, name, descr);
        this.setCachedValue(value);

        if(this.name === 'level') {
            this.adjust = {
                'oldLevel': value,
                'func': 'bright',
                'amount': 0
            }
        }
    }

    setValue(value) {
        if(this.name === 'level') {
            var percentDiff = Math.abs(value - this.adjust.oldLevel);
            this.adjust.amount = Math.round(percentDiff / 100 * 22);    // The maximum value is 22

            if(value >= this.adjust.oldLevel) {
                this.adjust.func = 'bright';
            }
            else {
                this.adjust.func = 'dim';
            }

            this.adjust.oldLevel = value;
        }

        return new Promise(resolve => {
            this.setCachedValue(value);
            resolve(this.value);
            this.device.notifyPropertyChanged(this);
        });
    }
}



class X10Device extends Device {
    /**
     * @param {X10CM11Adapter} adapter
     * @param {String} id - A globally unique identifier
     * @param {Object} template - the virtual thing to represent
     */
    constructor(adapter, id, x10Addr, moduleType) {
        super(adapter, id);

        var template = X10_DEVICE_TYPES[moduleType];
        this.name = 'X10 ' + template.name + ' (' + x10Addr + ')';
        this.type = template.type
        this.x10Addr = x10Addr;

        console.log(template.properties);
        for (let prop of template.properties) {
            this.properties.set(prop.name,
                new X10Property(this, prop.name, prop.metadata, prop.value));
        }

        console.log('CM11A Device Added: ' + this.name + ' with address ' + this.x10Addr);

        this.adapter.handleDeviceAdded(this);
    }

    notifyPropertyChanged(property) {
        super.notifyPropertyChanged(property);

        console.log('CM11A Property changed for ' + this.x10Addr + ': ' + property.name + ' = ' + property.value);

        switch(property.name) {
            case 'on': {
                if(property.value) {
                    this.adapter.cm11a.turnOn([this.x10Addr]);
                }
                else {
                    this.adapter.cm11a.turnOff([this.x10Addr]);
                }
                break;
            }

            case 'level': {
                console.log('CM11A Adjusting level: ' + property.adjust.func + ' = ' + property.adjust.amount );
                this.adapter.cm11a[property.adjust.func]([this.x10Addr], property.adjust.amount);
                break;
            }
        }
    }
}


class X10CM11Adapter extends Adapter {
    constructor(addonManager, manifest) {
        super(addonManager, 'x10-unknown', manifest.name);

        this.serialDevice = manifest.moziot.config.device;
        this.cm11a = CM11A();

        this.cm11a.on('unitStatus', (status) => {
            this.unitStatusReported(status);
        });

        console.log('CM11A: Opening ' + this.serialDevice);
        this.cm11a.start(this.serialDevice);

        addonManager.addAdapter(this);

        for(let i = 0; i < manifest.moziot.config.modules.length; i++) {
            var module = manifest.moziot.config.modules[i];
            var id = 'x10-' + module.houseCode + module.unitCode;
            var x10Addr = module.houseCode + module.unitCode;

            if(!this.devices[id]) {
                new X10Device(this, id, x10Addr, module.moduleType);
            }
        }
    }

    unitStatusReported(status) {
        console.log('CM11A Unit Status');
        console.log(status);
    }

    unload() {
        return new Promise(resolve => {
            this.cm11a.on('close', () => {
                console.log('CM11A Stopped.');
                resolve();
            });

            console.log('CM11A Stopping...');
            this.cm11a.stop();
        });
    }
}


function LoadX10CM11Adapter(addonManager, manifest, errorCallback) {
    const adapter = new X10CM11Adapter(addonManager, manifest);
}


module.exports = LoadX10CM11Adapter;

