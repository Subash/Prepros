/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap, Prepros */

//Tooltip directive
prepros.directive('linkExternal', [

    '$timeout',

    function ($timeout) {

        'use strict';

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                $timeout(function () {
                    element.on('click', function (e) {
                        e.preventDefault();
                        Prepros.gui.Shell.openExternal(attrs.href);
                    });
                }, 0);
            }
        };

    }
]);