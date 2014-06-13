/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap, Prepros */

//Control+Click Directive
prepros.directive('ctrlClick', [

    '$timeout',

    function ($timeout) {

        'use strict';

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                element.on('click', function (e) {

                    if (e.ctrlKey || e.metaKey) {

                        scope.$apply(function () {
                            scope.$eval(attrs.ctrlClick);
                        });

                        e.preventDefault();
                    }
                });
            }
        };

    }
]);