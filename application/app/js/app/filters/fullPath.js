/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

'use strict';

prepros.filter('fullPath', function () {

    var path = require('path');

    return function (string, data) {

        if(string.indexOf(':')<0) {
            string = path.join(data.basePath, string);
        }

        return string;
    };
});