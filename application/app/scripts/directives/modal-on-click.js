/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap */

//Popover directive
prepros.directive('modalOnClick', [

    '$timeout',

    function ($timeout) {

        'use strict';

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                $timeout(function () {

                    element.on('click', function(e) {

                        e.preventDefault();
                        $(attrs.modalOnClick).modal();

                    });
                });

            }
        };
    }
]);