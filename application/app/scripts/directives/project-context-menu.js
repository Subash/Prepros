/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap, angular */

//Tooltip directive
prepros.directive('projectContextMenu', [

    '$rootScope',
    '$location',
    'compiler',
    'liveServer',
    'projectsManager',
    'utils',

    function (
        $rootScope,
        $location,
        compiler,
        liveServer,
        projectsManager,
        utils
    ) {

        'use strict';

        var gui = require('nw.gui');
        var fs = require('fs-extra');

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
                    label: 'Toggle File Watcher',
                    click: function () {

                        scope.$apply(function () {
                            project.config.watch = !project.config.watch;
                        });
                    }
                }));

                menu.append(new gui.MenuItem({
                    label: 'Open Project URL',
                    click: function () {

                        if(project.config.useCustomServer) {

                            utils.openBrowser(project.config.customServerUrl);

                        } else {

                            utils.openBrowser(liveServer.getLiveUrl(project));
                        }
                    }
                }));

                menu.append(new gui.MenuItem({
                    label: 'Copy Project URL',
                    click: function () {

                        if(project.config.useCustomServer) {

                            gui.Clipboard.get().set(project.config.customServerUrl, 'text');

                        } else {

                            gui.Clipboard.get().set(liveServer.getLiveUrl(project), 'text');
                        }
                    }
                }));

                menu.append(new gui.MenuItem({
                    label: 'Compile All Files',
                    click: function () {

                        var files = projectsManager.getProjectFiles(project.id);
                        _.each(files, function (file) {

                            compiler.compile(project.id, file.id);

                        });
                    }
                }));

                menu.append(new gui.MenuItem({
                    label: 'Optimize Images',
                    click: function () {

                        $rootScope.$apply(function () {
                            $location.path('/optim/' + project.id);
                        });
                    }
                }));

                menu.append(new gui.MenuItem({
                    label: 'Remove Project',
                    click: function () {

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
                            $rootScope.$apply(function () {
                                projectsManager.removeProject(project.id);
                            });
                        });

                        confirmMsg.on('click:cancel', 'destroy');
                    }
                }));

                menu.append(new gui.MenuItem({
                    type: 'separator'
                }));

                menu.append(new gui.MenuItem({
                    label: 'Create Config File',
                    enabled: false
                }));

                menu.append(new gui.MenuItem({
                    label: 'Remote Inspect',
                    enabled: false
                }));

                element.on('contextmenu', function (e) {

                    e.preventDefault();

                    menu.popup(e.pageX, e.pageY);
                });
            }
        };

    }
]);