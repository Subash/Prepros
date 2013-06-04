/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

'use strict';

//Conditional includes
prepros.directive('ngIncludeIf', function ($timeout, $compile, $http, $templateCache) {

    return {

        restrict: 'A',
        link: function (scope, element, attrs) {

            $timeout(function(){

                scope.$watch(attrs.ngIncludeIf, function(){

                    if(scope.$eval(attrs.ngIncludeIf)) {

                        $http({method: 'GET', url: scope.$eval(attrs.src)}).
                            success(function(data) {

                                element.html($compile(data)(scope));

                            });

                    } else {

                        element.html('');

                    }

                }, true);

            });

        }
    };
});