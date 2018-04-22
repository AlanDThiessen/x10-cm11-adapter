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


function x10Addr() {
    return {
        name: 'X10 Address',
        value: 'A1',
        metadata: {
            type: 'string'
        }
    };
}


function on() {
    return {
        name: 'on',
        value: false,
        metadata: {
            type: 'boolean'
        }
    };
}


function level() {
    return {
        name: 'level',
        value: 0,
        metadata: {
            type: 'number',
            unit: 'percent'
        }
    };
}


const lampModule = {
    type: 'lampModule',
    name: 'X10 Lamp Module',
    properties: [
        x10Addr(),
        on(),
        level()
    ]
};


const applianceModule = {
    type: 'applianceModule',
    name: 'X10 Appliance Module',
    properties: [
        x10Addr(),
        on(),
        level()
    ]
};


const onOffSwitch = {
    type: 'onOffSwitch',
    name: 'X10 On/Off Switch',
    properties: [
        x10Addr(),
        on()
    ]
};


const dimmerSwitch = {
    type: 'dimmerSwitch',
    name: 'X10 Dimmer Switch',
    properties: [
        x10Addr(),
        on(),
        level()
    ]
};


const binarySensor = {
    type: 'binarySensor',
    name: 'X10 On/Off Sensor',
    properties: [
        x10Addr(),
        on()
    ]
};


const X10_DEVICE_TYPES = [
    lampModule,
    applianceModule,
    onOffSwitch,
    dimmerSwitch,
    binarySensor
];


class X10Property extends Property {
    constructor(device, name, descr, value) {
        super(device, name, descr);
        this.setCachedValue(value);
    }

    /**
     * @param {any} value
     * @return {Promise} a promise which resolves to the updated value.
     */
    setValue(value) {
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
    constructor(adapter, id, template) {
        super(adapter, id);

        this.name = template.name;
        this.type = template.type;

        for (let prop of template.properties) {
            this.properties.set(prop.name,
                new X10Property(this, prop.name, prop.metadata, prop.value));
        }

        this.adapter.handleDeviceAdded(this);
    }
}


class X10CM11Adapter extends Adapter {
    constructor(addonManager, manifest) {
        super(addonManager, 'x10-unknown', manifest.name);

        this.serialDevice = manifest.moziot.config.device;
        this.cm11a = CM11A();
        this.cm11a.start(this.serialDevice);

        addonManager.addAdapter(this);

        this.addAllDeviceTypes();
    }


    addAllDeviceTypes() {
        for (let i = 0; i < X10_DEVICE_TYPES.length; i++) {
            var id = 'x10-' + i;

            if (!this.devices[id]) {
                new X10Device(this, id, X10_DEVICE_TYPES[i]);
            }
        }
    }

}


function LoadX10CM11Adapter(addonManager, manifest, errorCallback) {
    const adapter = new X10CM11Adapter(addonManager, manifest);
}


module.exports = LoadX10CM11Adapter;

