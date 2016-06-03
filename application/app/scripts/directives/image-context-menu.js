/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap, Prepros*/

//Tooltip directive
prepros.directive('imageContextMenu', [

  'pro',

  function(pro) {

    'use strict';

    var gui = require('nw.gui');

    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        var image = scope.$eval(attrs.imageContextMenu);

        var menu = new Prepros.gui.Menu();

        menu.append(new Prepros.gui.MenuItem({
          label: 'Open',
          click: function() {

            if (_.isEmpty(scope.multiSelect.images)) {

              scope.openImage(image.pid, image.id);

            } else {

              pro.showMessage();

            }
          }
        }));

        menu.append(new Prepros.gui.MenuItem({
          label: 'Optimize',
          click: function() {


            if (_.isEmpty(scope.multiSelect.images)) {

              scope.$apply(function() {
                scope.optimizeImage(image.pid, image.id);
              });

            } else {

              pro.showMessage();

            }
          }
        }));

        var explorer = (Prepros.PLATFORM_WINDOWS) ? 'Explorer' : 'Finder';

        menu.append(new Prepros.gui.MenuItem({
          label: 'Show in ' + explorer,
          click: function() {

            if (_.isEmpty(scope.multiSelect.images)) {

              scope.showImageInFolder(image.pid, image.id);

            } else {

              pro.showMessage();

            }
          }
        }));

        element.on('contextmenu', function(e) {

          e.preventDefault();

          menu.popup(e.pageX, e.pageY);
        });
      }
    };

  }
]);
