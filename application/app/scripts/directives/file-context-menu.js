/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap, alertify */

//Tooltip directive
prepros.directive('fileContextMenu', function (compiler, projectsManager, $rootScope) {

    'use strict';

    var gui = require('nw.gui');

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var file = scope.$eval(attrs.fileContextMenu);

            var menu = new gui.Menu();

            menu.append(new gui.MenuItem({
                label: 'Open File',
                click: function(){
                    gui.Shell.openItem(file.input);
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Compile File',
                click: function(){
                    compiler.compile(file.id);
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Toggle Auto Compile',
                click: function(){

                    $rootScope.$apply(function(){
                        var f = _.findWhere(scope.files, {id: file.id});

                        f.config.autoCompile = !f.config.autoCompile;
                    });
                }
            }));

            var explorer = (process.platform === 'win32')? 'Explorer': 'Finder';

            menu.append(new gui.MenuItem({
                label: 'Show in ' + explorer,
                click: function(){
                    gui.Shell.showItemInFolder(file.input);
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Change Output',
                click: function(){
                    element.find('.output').trigger('click');
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Reset File Settings',
                click: function(){

                    alertify.set({ buttonFocus: "none", buttonReverse: true});
                    alertify.confirm('Are you sure you want to reset the settings of this file?', function(y){

                        if(y) {

                            projectsManager.removeFile(file.id);

                            $rootScope.$apply(function(){

                                projectsManager.addFile(file.input, projectsManager.getProjectById(file.pid).path, true);

                            });
                        }

                    });

                }
            }));

            element.on('contextmenu', function(e){

                e.preventDefault();

                menu.popup(e.pageX, e.pageY);
            });
        }
    };

});