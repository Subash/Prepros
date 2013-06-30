/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false, globalstrict:true*/
/*global angular */

'use strict';

var prepros = angular.module('prepros', []).config(function ($routeProvider, $compileProvider) {

    //Sanitize unsafe url
    $compileProvider.urlSanitizationWhitelist(/^\s*(file):/);

    //Routers
    $routeProvider
        .when('/home', {path: 'home'})
        .when('/files/:pid', {path: 'files'})
        .when('/files/:pid/:fid', {path: 'files'})
        .when('/log', {path : 'log'})
        .otherwise({redirectTo: '/home'});
});