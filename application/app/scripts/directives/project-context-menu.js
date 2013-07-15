/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap, alertify */

//Tooltip directive
prepros.directive('projectContextMenu', function (projectsManager, liveServer, compiler, $location, $rootScope) {

    'use strict';

    var gui = require('nw.gui');

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var project = scope.$eval(attrs.projectContextMenu);

            var menu = new gui.Menu();

            menu.append(new gui.MenuItem({
                label: 'Open Project Folder',
                click: function () {
                    gui.Shell.openItem(project.path);
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Refresh Project',
                click: function () {

                    scope.$apply(function () {
                        projectsManager.refreshProjectFiles(project.id);
                    });
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Open Project URL',
                click: function () {

                    if (project.config.useCustomServer) {

                        gui.Shell.openExternal(project.config.customServerUrl);

                    } else {

                        gui.Shell.openExternal(liveServer.getLiveUrl(project));

                    }
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Copy Project URL',
                click: function () {

                    var url = (project.config.useCustomServer) ? project.config.useCustomServer : liveServer.getLiveUrl(project);

                    require('nw.gui').Clipboard.get().set(url, 'text');
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Compile All Files',
                click: function () {

                    var files = projectsManager.getProjectFiles(project.id);

                    _.each(files, function (file) {

                        compiler.compile(file.id);

                    });
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Optimize Images',
                click: function () {

                    $rootScope.$apply(function(){
                        $location.path('/optim/' + project.id);
                    });
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Remove Project',
                click: function () {

                    alertify.set({ buttonFocus: "none", buttonReverse: true});
                    alertify.confirm('Are you sure you want to remove this project?', function (y) {

                        if (y) {
                            scope.$apply(function () {
                                projectsManager.removeProject(project.id);
                            });
                        }

                    });
                }
            }));

            element.on('contextmenu', function (e) {

                e.preventDefault();

                menu.popup(e.pageX, e.pageY);
            });
        }
    };

});