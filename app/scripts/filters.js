/*jshint browser: true, node: true*/
/*global prepros, _ */

'use strict';

//Filter by project id
prepros.filter('byProject', function ($routeParams) {
    return function (files) {
        return _.where(files, {pid: $routeParams.pid});
    };
});