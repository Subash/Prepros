/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros, $, _, Mousetrap, angular, Prepros */

//Tooltip directive
prepros.directive('projectContextMenu', [

    '$rootScope',
    '$location',

    function (
        $rootScope,
        $location
    ) {

        'use strict';
        
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                var pid = scope.$eval(attrs.projectContextMenu);

                var menu = new Prepros.gui.Menu();

                menu.append(new Prepros.gui.MenuItem({
                    label: 'Open Project Folder',
                    click: function () {
                        scope.openProjectFolder(pid);
                    }
                }));

                menu.append(new Prepros.gui.MenuItem({
                    label: 'Refresh Project',
                    click: function () {

                        scope.$apply(function () {
                            scope.refreshProject(pid);
                        });
                    }
                }));

                var watcherItem = new Prepros.gui.MenuItem({
                    label: 'Enable/Disable File Watcher',
                    click: function() {
                        scope.$apply(function() {
                            scope.toggleFileWatcher(pid);
                        });
                    }
                });

                menu.append(watcherItem);

                menu.append(new Prepros.gui.MenuItem({ type: 'separator' }));

                menu.append(new Prepros.gui.MenuItem({
                    label: 'Open Live Preview',
                    click: function () {
                        scope.openProjectPreview(pid);
                    }
                }));

                menu.append(new Prepros.gui.MenuItem({
                    label: 'Copy Live Preview URL',
                    click: function () {
                        scope.copyProjectPreviewUrl(pid);
                    }
                }));

                menu.append(new Prepros.gui.MenuItem({
                    label: 'Open Remote Inspector',
                    click: function () {
                        scope.openRemoteInspect();
                    }
                }));

                menu.append(new Prepros.gui.MenuItem({ type: 'separator' }));

                menu.append(new Prepros.gui.MenuItem({
                    label: 'Compile All Files',
                    click: function () {
                        scope.compileAllFiles(pid);
                    }
                }));

                menu.append(new Prepros.gui.MenuItem({
                    label: 'Optimize Images',
                    click: function () {

                        $rootScope.$apply(function () {
                            $location.path('/images/' + pid);
                        });
                    }
                }));

                menu.append(new Prepros.gui.MenuItem({
                    label: 'Optimize All Images',
                    click: function () {

                        $rootScope.$apply(function () {
                            scope.optimizeAllImages(pid);
                        });
                    }
                }));

                menu.append(new Prepros.gui.MenuItem({
                    label: 'Push To Remote',
                    click: function () {

                        scope.pushProjectToRemote(pid);
                    }
                }));

                menu.append(new Prepros.gui.MenuItem({ type: 'separator' }));

                menu.append(new Prepros.gui.MenuItem({
                    label: 'Project Options',
                    click: function () {

                        $rootScope.$apply(function () {
                            $location.path('/project-options/' + pid + '/general');
                        });
                    }
                }));

                menu.append(new Prepros.gui.MenuItem({
                    label: 'Create Config File',
                    click: function () {
                        scope.createProjectConfigFile(pid);
                    }
                }));

                menu.append(new Prepros.gui.MenuItem({ type: 'separator' }));

                menu.append(new Prepros.gui.MenuItem({
                    label: 'Remove Project',
                    click: function () {
                        scope.removeProject(pid);
                    }
                }));

                element.on('contextmenu', function (e) {

                    e.preventDefault();

                    menu.remove(watcherItem);

                    var watcherLabel = ( (scope.projects[pid].config.watch)? 'Disable': 'Enable' ) + ' File Watcher';

                    watcherItem = new Prepros.gui.MenuItem({
                        label: watcherLabel,
                        click: function () {

                            scope.$apply(function () {
                                scope.toggleFileWatcher(pid);
                            });
                        }
                    });

                    menu.insert(watcherItem, 2);

                    menu.popup(e.pageX, e.pageY);
                });
            }
        };

    }
]);