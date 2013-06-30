/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ , $*/

//Files List controls
prepros.controller('MultiDeviceCtrl', function ($scope) {

    'use strict';

    var os = require('os');

    var ifaces = os.networkInterfaces();

    var ifacesKeys = Object.keys(ifaces);

    $scope.addresses = [];

    _.each(ifacesKeys, function(face) {

        var add = _.filter(ifaces[face], function(f){
            return f.family === "IPv4" && !f.internal;
        });

        if(!_.isEmpty(add)) {
            _.each(add, function(a) {
                $scope.addresses.push({
                    name: face,
                    ip : a.address
                });
            });
        }
    });
});