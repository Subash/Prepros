/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap, Prepros */

//Tooltip directive
prepros.directive('copySelectedText', [function() {

  'use strict';

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {

      var menu = new Prepros.gui.Menu();

      menu.append(new Prepros.gui.MenuItem({
        label: 'Copy Selection',
        click: function() {
          Prepros.gui.Clipboard.get().set(window.getSelection().toString(), 'text');
        }
      }));

      element.on('contextmenu', function(e) {

        e.preventDefault();

        if (window.getSelection().toString() !== "") {

          menu.popup(e.pageX, e.pageY);
        }
      });
    }
  };
}]);
