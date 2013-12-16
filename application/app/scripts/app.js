/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false, globalstrict:true*/
/*global angular */

'use strict';

var prepros = angular.module('prepros', []).config([

    '$compileProvider',
    '$routeProvider',

    function ($compileProvider, $routeProvider) {

        //Routers
        $routeProvider
            .when('/home', {path: 'HOME'})
            .when('/files/:pid', {path: 'FILES'})
            .when('/files/:pid/:fid', {path: 'FILES'})
            .when('/project-options/:pid/:section', {path: 'PROJECT_OPTIONS'})
            .when('/log', {path: 'LOG'})
            .when('/images/:pid', {path: 'IMAGE_OPTIMIZATION'})
            .when('/images/:pid/:imgid', {path: 'IMAGE_OPTIMIZATION'})
            .when('/app-options/:section', {path: 'APP_OPTIONS'})
            .otherwise({redirectTo: '/home'});
    }]);