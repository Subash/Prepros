/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap */

//Tooltip directive
prepros.directive('projectContextMenu', function (projectsManager, liveServer) {

    'use strict';

    var gui = require('nw.gui');

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var project = scope.$eval(attrs.projectContextMenu);

            var menu = new gui.Menu();

            menu.append(new gui.MenuItem({
                label: 'Open project folder',
                click: function(){
                    gui.Shell.openItem(project.path);
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Refresh project',
                click: function(){

                    scope.$apply(function(){
                        projectsManager.refreshProjectFiles(project.id);
                    });
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Open project url',
                click: function(){

                    if(project.config.useCustomServer){

                        gui.Shell.openExternal(project.config.customServerUrl);

                    } else {

                        gui.Shell.openExternal(liveServer.getLiveUrl(project));

                    }
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Remove project',
                click: function(){

                    scope.$apply(function(){
                        projectsManager.removeProject(project.id);
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