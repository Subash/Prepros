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
    return function (string, cssPath, jsPath, htmlPath) {

        return $interpolate(string)(cssPath, jsPath, htmlPath);

    };
});