/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ , $*/

//Log Controller
prepros.controller('LogCtrl',  [

    '$scope',
    'notification',

    function (
        $scope,
        notification
    ) {

        'use strict';

        $scope.log = notification.getLog();

        //Function to clear log
        $scope.clearLog = function () {
            notification.clearLog();
        };

        //Update log on log change event
        $scope.$on('logUpdate', function () {
            $scope.log = notification.getLog();
        });
    }
]);