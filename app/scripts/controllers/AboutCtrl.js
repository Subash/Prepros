/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ , $*/

//Files List controls
prepros.controller('AboutCtrl', function ($scope, config, utils) {

    'use strict';

    $scope.config = config;
    $scope.gems = [];
    $scope.node_modules = [];
    $scope.errorChecking = false;
    $scope.upToDate = false;
    $scope.checking = true;

    $scope.update = {
        available: false,
        version: config.version,
        date: ""
    };

    config.checkUpdate(function(data){

        if(data.available) {
            $scope.update = {
                available: true,
                version: data.version,
                date: data.date
            };
        } else {

            $scope.upToDate = true;
        }

        $scope.checking = false;

    }, function(){

        $scope.errorChecking = true;

        $scope.checking = false;

    });

    for ( var nm in config.node_modules ) {

        if(config.node_modules.hasOwnProperty(nm)) {

            $scope.node_modules.push(nm + " -> " + config.node_modules[nm]);

        }

    }

    for ( var gem in config.ruby.gems ) {

        if(config.ruby.gems.hasOwnProperty(gem)) {

            $scope.gems.push(gem + " -> " + config.ruby.gems[gem].version);

        }

    }

    $scope.go = function (place) {

        utils.openBrowser(config.online[place]);

    };

});