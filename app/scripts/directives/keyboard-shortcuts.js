/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap */

//Directive for keyboard shortcuts
//TODO MAC Commands
prepros.directive('bindKeyboardShortcuts', function(projectsManager, liveServer, compiler, utils){

    'use strict';

    var fs = require('fs'),
        path = require('path');

    return {
        restrict: 'A',
        link: function(scope){

            //New Project
            Mousetrap.bind('ctrl+n', function() {

                var elm = $('<input type="file" nwdirectory>');

                elm.trigger('click');

                $(elm).on('change', function (e) {

                    var files = e.currentTarget.files;

                    _.each(files, function (file) {

                        //Get stats
                        var stats = fs.statSync(file.path);

                        //Check if it is a directory and not a drive
                        if (stats.isDirectory() && path.dirname(file.path) !== file.path) {

                            //Add to projects
                            projectsManager.addProject(file.path);
                        }
                    });

                });

                return false;
            });

            //Refresh Project Files
            Mousetrap.bind(['ctrl+r', 'f5'], function() {
                if(scope.selectedProject.id){

                    projectsManager.refreshProjectFiles(scope.selectedProject.id);

                }
                return false;
            });

            //Open Live Url
            Mousetrap.bind('ctrl+l', function() {

                if(scope.selectedProject.id){
                    var url = liveServer.getLiveUrl(scope.selectedProject);

                    utils.openBrowser(url);
                }
                return false;
            });

            //Remove Project
            Mousetrap.bind('ctrl+d', function() {
                if(scope.selectedProject.id){

                    projectsManager.removeProject(scope.selectedProject.id);
                }
                return false;
            });

            //Compile all project files
            Mousetrap.bind('ctrl+shift+c', function() {
                if(scope.selectedProject.id){

                    var projects = projectsManager.getProjectFiles(scope.selectedProject.id);

                    _.each(projects, function(project){

                        compiler.compile(project.id);

                    });
                }
                return false;
            });

            //Compile selected project file
            Mousetrap.bind('ctrl+c', function() {

                if(scope.selectedFile.id){

                    compiler.compile(scope.selectedFile.id);
                }

                return false;
            });

        }
    };

});
