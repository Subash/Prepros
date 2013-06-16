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
prepros.directive('ngIncludeWhen', function ($timeout, $compile, $http) {

    return {

        restrict: 'A',
        link: function (scope, element, attrs) {

            $timeout(function(){

                scope.$on('$routeChangeSuccess', function(){

                    if(scope.$eval(attrs.ngIncludeWhen)) {

                        $http({method: 'GET', url: scope.$eval(attrs.src)}).
                            success(function(data) {

                                element.html($compile(data)(scope));

                            });

                    } else {

                        element.html('');

                    }
                });
            });
        }
    };
});