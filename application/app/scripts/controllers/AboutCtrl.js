/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ , $*/

//About Window Controller
prepros.controller('AboutCtrl', [

    '$scope',
    'config',

    function (
        $scope,
        config
    ) {

        'use strict';

        $scope.gems = [];
        $scope.node_modules = [];

        for (var nm in config.node_modules) {

            if (config.node_modules.hasOwnProperty(nm)) {

                $scope.node_modules.push(nm + " -> " + config.node_modules[nm]);

            }

        }

        for (var gem in config.ruby_gems) {

            if (config.ruby_gems.hasOwnProperty(gem)) {

                $scope.gems.push(gem + " -> " + config.ruby_gems[gem]);

            }

        }
    }
]);