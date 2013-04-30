/*jshint browser: true, node: true*/
/*global nw, prepros, $, _, angular */

'use strict';

//Filter by project id
prepros.filter('byProject', function ($routeParams) {
    return function (files) {
        return _.where(files, {pid: $routeParams.pid});
    };
});