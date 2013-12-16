/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros, $, angular, _*/

prepros.factory("log", [

    function () {

        'use strict';

        var log = [];

        var add = function (details) {

            log.unshift(details);

            if (log.length > 30) {
                log.length = 30;
            }
        };

        var clear = function () {
            log.length = 0;
        };

        return {
            add: add,
            clear: clear,
            log: log
        };
    }
]);
