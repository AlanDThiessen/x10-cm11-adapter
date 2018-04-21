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

(function() {
    'use strict';

    let Adapter, Database, utils, CM11A;

    CM11A = require('cm11a-js');
    const gwa = require('gateway-addon');
    Adapter = gwa.Adapter;
    Database = gwa.Database;
    utils = gwa.Utils;


    class X10CM11Adaptor extends Adapter {
        constructor(addonManager, manifest) {
            super(addonManager, 'x10-unknown', manifest.name);

            this.cm11a = CM11A();
            addonManager.addAdapter(this);
        }
    }

    function loadX10CM11Adapter(addonManager, manifest) {
        const adapter = new X10CM11Adaptor(addonManager, manifest)
    }

    module.exports = loadX10CM11Adapter;

})();