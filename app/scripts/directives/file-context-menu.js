/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap */

//Tooltip directive
prepros.directive('fileContextMenu', function (compiler) {

    'use strict';

    var gui = require('nw.gui');

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var file = scope.$eval(attrs.fileContextMenu);

            var menu = new gui.Menu();

            menu.append(new gui.MenuItem({
                label: 'Open file',
                click: function(){
                    gui.Shell.openItem(file.input);
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Compile file',
                click: function(){
                    compiler.compile(file.id);
                }
            }));

            var explorer = (process.platform === 'win32')? 'explorer': 'finder';

            menu.append(new gui.MenuItem({
                label: 'Show in ' + explorer,
                click: function(){
                    gui.Shell.showItemInFolder(file.input);
                }
            }));

            menu.append(new gui.MenuItem({
                label: 'Change output',
                click: function(){
                    element.find('.output').trigger('click');
                }
            }));

            element.on('contextmenu', function(e){

                e.preventDefault();

                menu.popup(e.pageX, e.pageY);
            });
        }
    };

});