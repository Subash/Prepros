/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros*/

prepros.filter('size', [

    function () {

        'use strict';

        return function (size) {

            var type = 'Bytes';

            if (isNaN(parseFloat(size))) return size + type;

            size = parseFloat(size);

            if (size > 1024) {
                size = size / 1024;
                type = 'KB';
            }

            if (size > 1024) {
                size = size / 1024;
                type = 'MB';
            }

            return size.toFixed(2) + ' ' + type;

        };
    }
]);