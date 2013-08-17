/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap */

//Tooltip directive
prepros.directive('tooltip', function ($timeout) {

    'use strict';

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            $timeout(function () {

                element.tooltip({delay: 500, title: attrs.tooltip, container: '.wrapper'});

            });

        }
    };

});