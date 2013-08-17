/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.filter('prettyPath', function () {

    'use strict';

    return function (string) {

        return string.replace(/\\/g, '/');

    };
});