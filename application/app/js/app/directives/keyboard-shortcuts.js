/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap, alertify */

//Directive for keyboard shortcuts
prepros.directive('keyboardShortcuts', function (projectsManager, liveServer, compiler, utils) {

    'use strict';

    var fs = require('fs'),
        path = require('path');

    return {
        restrict: 'A',
        link: function (scope) {

            //New Project
            Mousetrap.bind(['ctrl+n', 'command+n'], function () {

                var elm = $('<input type="file" nwdirectory>');

                elm.trigger('click');

                $(elm).on('change', function (e) {

                    var files = e.currentTarget.files;

                    _.each(files, function (file) {

                        //Get stats
                        var stats = fs.statSync(file.path);

                        //Check if it is a directory and not a drive
                        if (stats.isDirectory() && path.dirname(file.path) !== file.path) {

                            scope.$apply(function () {

                                //Add to projects
                                projectsManager.addProject(file.path);

                            });

                        }
                    });

                });

                return false;
            });

            //Refresh Project Files
            Mousetrap.bind(['ctrl+r', 'f5', 'command+r'], function () {
                if (scope.selectedProject.id) {

                    scope.$apply(function () {

                        projectsManager.refreshProjectFiles(scope.selectedProject.id);

                    });

                }
                return false;
            });

            //Open Live Url
            Mousetrap.bind(['ctrl+l', 'command+l'], function () {

                if (scope.selectedProject.id) {

                    var url = liveServer.getLiveUrl(scope.selectedProject);

                    utils.openBrowser(url);

                }
                return false;
            });

            //Remove Project
            Mousetrap.bind(['ctrl+d', 'command+d'], function () {
                if (scope.selectedProject.id) {

                    alertify.set({ buttonFocus: "ok", buttonReverse: true});
                    alertify.confirm('Are you sure you want to remove this project?', function (y) {

                        if (y) {
                            scope.$apply(function () {
                                projectsManager.removeProject(scope.selectedProject.id);
                            });
                        }

                    });
                }
                return false;
            });

            //Compile all project files
            Mousetrap.bind(['ctrl+shift+c', 'command+shift+c'], function () {
                if (scope.selectedProject.id) {

                    var files = projectsManager.getProjectFiles(scope.selectedProject.id);

                    _.each(files, function (file) {

                        compiler.compile(file.id);

                    });
                }
                return false;
            });

            //Compile selected project file
            Mousetrap.bind(['ctrl+c', 'command+c'], function () {

                if (window.getSelection().toString() !== "") {

                    require('nw.gui').Clipboard.get().set(window.getSelection().toString(), 'text');

                } else {

                    if (scope.selectedFile.id) {

                        compiler.compile(scope.selectedFile.id);
                    }

                }

                return false;
            });

        }
    };

});