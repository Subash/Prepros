/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _, $ */

//Title Bar controls
prepros.controller('SidebarCtrl', function ($scope, projectsManager, utils, liveServer, $rootScope) {

    'use strict';

    var fs = require('fs'),
        path = require('path');


    $scope.openProjectFolder= function(folder) {

        require('nw.gui').Shell.openItem(folder);

    };

    $scope.addProject = function(){

        //Function to add new project
        var elm = $('<input type="file" nwdirectory>');

        elm.trigger('click');

        $(elm).on('change', function (e) {

            var file = e.currentTarget.files[0].path;

            //Must notify scope after async operation
            $scope.$apply(function(){
                projectsManager.addProject(file);
            });

        });
    };

    //function to refresh project files
    $scope.refreshFiles = function(){

        projectsManager.refreshProjectFiles($scope.selectedProject.id);

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

        alertify.set({ buttonFocus: "none" });
        alertify.confirm('Are you sure you want to remove this project?', function(y){

            if(y) {
                $scope.$apply(function(){
                    projectsManager.removeProject($scope.selectedProject.id);
                });
            }

        });

    };

});
