/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap*/

//Tooltip directive
prepros.directive('fileContextMenu', function (compiler, projectsManager, $rootScope, $filter, utils) {

    'use strict';

    var gui = require('nw.gui');

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var file = scope.$eval(attrs.fileContextMenu);

            var menu = new gui.Menu();

            menu.append(new gui.MenuItem({
                label: 'Open File',
                click: function () {
                    gui.Shell.openItem($filter('fullPath')(file.input, { basePath: projectsManager.getProjectById(file.pid).path}));
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Compile File',
                click: function () {
                    compiler.compile(file.pid, file.id);
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Toggle Auto Compile',
                click: function () {

                    $rootScope.$apply(function () {
                        var f = _.findWhere(scope.selectedProject.files, {id: file.id});
                        f.config.autoCompile = !f.config.autoCompile;
                    });
                }
            }));

            var explorer = (process.platform === 'win32') ? 'Explorer' : 'Finder';

            menu.append(new gui.MenuItem({
                label: 'Show in ' + explorer,
                click: function () {
                    gui.Shell.showItemInFolder($filter('fullPath')(file.input, { basePath: projectsManager.getProjectById(file.pid).path}));
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Change Output',
                click: function () {
                    element.find('.output').trigger('click');
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Reset File Settings',
                click: function () {

                    var confirmMsg = utils.notifier.notify({
                        message: "Are you sure you want to reset the settings of this file?",
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
                            var filePath = $filter('fullPath')(file.input, { basePath: projectsManager.getProjectById(file.pid).path});
                            projectsManager.removeFile(file.pid, file.id);
                            projectsManager.addFile(file.pid, filePath);
                        });
                    });

                    confirmMsg.on('click:cancel', 'destroy');

                }
            }));

            element.on('contextmenu', function (e) {

                e.preventDefault();

                menu.popup(e.pageX, e.pageY);
            });
        }
    };

});