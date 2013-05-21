/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _, $ */

//Title Bar controls
prepros.controller('SidebarCtrl', function ($scope, projectsManager, utils, liveServer) {

    'use strict';

    var fs = require('fs'),
        path = require('path');

    $scope.addProject = function(){

        //Function to add new project
        var elm = $('<input type="file" nwdirectory>');

        elm.trigger('click');

        $(elm).on('change', function (e) {

            var file = e.currentTarget.files[0].path;

            //Must notify scope after async operation
            projectsManager.addProject(file);
        });
    };

    //function to refresh project files
    $scope.refreshFiles = function(){

        projectsManager.refreshProjectFiles($scope.selectedProject.id);

    };

    //Function to show project options
    $scope.showOptions = function(){

        $('.project-options').slideDown('fast');

        $('.project-options button').click(function(){
            $('.project-options').slideUp('fast');
        });

    };

    //Function to open live url
    $scope.openLiveUrl = function(){

        if($scope.selectedProject.config.useCustomServer){

            utils.openBrowser($scope.selectedProject.config.customServerUrl);

        } else {

            utils.openBrowser(liveServer.getLiveUrl($scope.selectedProject));

        }

    };

    //Function to remove project
    $scope.removeProject = function(){

        projectsManager.removeProject($scope.selectedProject.id);

    };

});
