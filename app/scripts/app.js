/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global angular */

'use strict';

var prepros = angular.module('prepros', []).config(function ($routeProvider, $compileProvider) {

    //Sanitize unsafe url
    $compileProvider.urlSanitizationWhitelist(/^\s*(file):/);

    //Routers
    $routeProvider
        .when('/home', {routePath: 'home'})
        .when('/files/:pid', {routePath: 'files'})
        .when('/files/:pid/:fid', {routePath: 'files'})
        .otherwise({redirectTo: '/home'});
});