/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

'use strict';

prepros.filter('interpolatePath', function ($interpolate) {
    return function (string, cssPath, jsPath, htmlPath, jsMinPath) {

        return require('path').normalize($interpolate(string)(cssPath, jsPath, htmlPath, jsMinPath));

    };
});