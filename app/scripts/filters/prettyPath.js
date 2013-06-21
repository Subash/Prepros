/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

'use strict';

prepros.filter('prettyPath', function () {
    return function (string) {

        return string.replace(/\\/g, '/');

    };
});