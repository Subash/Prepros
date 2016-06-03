/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false, curly: false*/
/*global prepros,  _ , $, Prepros*/

//Controller for multiple device
prepros.controller('MultiDeviceCtrl', [

  '$scope',
  'liveServer',
  'pro',

  function($scope, liveServer, pro) {

    'use strict';

    var os = require('os');

    $scope.addresses = [];

    $scope.refreshIpList = function() {

      $scope.addresses = [];

      var ifaces = os.networkInterfaces();

      var ifacesKeys = Object.keys(ifaces);

      _.each(ifacesKeys, function(face) {

        var add = _.filter(ifaces[face], function(f) {
          return f.family === "IPv4" && !f.internal;
        });

        if (!_.isEmpty(add)) {

          _.each(add, function(a) {

            $scope.addresses.push({
              name: face,
              ip: a.address,
              qr: window.getQR('http://' + a.address + ':' + Prepros.MAIN_SERVER_PORT)
            });
          });
        }
      });
    };

    $scope.refreshIpList();

    $scope.openRemoteInspect = function() {

      pro.showMessage();
    };
  }
]);
