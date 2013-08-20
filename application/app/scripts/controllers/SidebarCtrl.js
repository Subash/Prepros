/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _, $*/

//Title Bar controls
prepros.controller('SidebarCtrl', function ($scope, projectsManager, utils, liveServer) {

    'use strict';

    var fs = require('fs'),
        path = require('path');


    $scope.openProjectFolder = function (folder) {

        require('nw.gui').Shell.openItem(folder);

    };

    //function to refresh project files
    $scope.refreshFiles = function () {

        projectsManager.refreshProjectFiles($scope.selectedProject.id);

    };

    //Function to open live url
    $scope.openLiveUrl = function () {

        utils.openBrowser(liveServer.getLiveUrl($scope.selectedProject));
    };

    //Function to remove project
    $scope.removeProject = function () {

        var confirmMsg = utils.notifier.notify({
            message: "Are you sure you want to remove this project?",
            type: "warning",
            buttons: [
                {'data-role': 'ok', text: 'Yes'},
                {'data-role': 'cancel', text: 'No'}
            ],
            destroy: true
        });

        confirmMsg.on('click:ok', function(){

            this.destroy();
            $scope.$apply(function () {
                projectsManager.removeProject($scope.selectedProject.id);
            });
        });

        confirmMsg.on('click:cancel', 'destroy');
    };

});
