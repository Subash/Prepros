/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, _ */

'use strict';

//Filter by project id
prepros.filter('project', function ($routeParams) {
    return function (files) {
        return _.where(files, {pid: $routeParams.pid});
    };
});