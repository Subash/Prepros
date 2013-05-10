/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap */

//Tooltip directive
prepros.directive('tooltip', function ($timeout) {

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            $timeout(function(){

                element.tooltip({delay: 500, title: attrs.tooltip, container: 'body'});

            });

        }
    };

});