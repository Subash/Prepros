/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap */

//Tooltip directive
prepros.directive('copySelectedText', function () {

    'use strict';

    var gui = require('nw.gui');

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var menu = new gui.Menu();

            menu.append(new gui.MenuItem({
                label: 'Copy selected text',
                click: function(){
                    require('nw.gui').Clipboard.get().set(window.getSelection().toString(), 'text');
                }
            }));

            element.on('contextmenu', function(e){

                e.preventDefault();

                if(window.getSelection().toString() !== "") {

                    menu.popup(e.pageX, e.pageY);

                }
            });
        }
    };

});