/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap, Prepros*/

//Tooltip directive
prepros.directive('fileContextMenu', [

  'pro',
  'utils',

  function(pro, utils) {

    'use strict';

    var gui = require('nw.gui');

    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        var file = scope.$eval(attrs.fileContextMenu);

        var menu = new Prepros.gui.Menu();

        menu.append(new Prepros.gui.MenuItem({
          label: 'Open',
          click: function() {

            if (_.isEmpty(scope.multiSelect.files)) {

              scope.openFile(file.pid, file.id);

            } else {

              pro.showMessage();
            }
          }
        }));

        menu.append(new Prepros.gui.MenuItem({
          label: 'Compile',
          click: function() {

            if (_.isEmpty(scope.multiSelect.files)) {

              scope.compile(file.pid, file.id);

            } else {

              scope.compileMultiSelectFiles();

            }
          }
        }));

        menu.append(new Prepros.gui.MenuItem({
          type: 'separator'
        }));

        var autoCompileItem = new Prepros.gui.MenuItem({
          label: 'Toggle Auto Compile',
          click: function() {
            //This is just a placeholder for later use
          }
        });

        menu.append(autoCompileItem);

        menu.append(new Prepros.gui.MenuItem({
          type: 'separator'
        }));

        var explorer = (Prepros.PLATFORM_WINDOWS) ? 'Explorer' : 'Finder';

        menu.append(new Prepros.gui.MenuItem({
          label: 'Show in ' + explorer,
          click: function() {

            if (_.isEmpty(scope.multiSelect.files)) {

              scope.showInFolder(file.pid, file.id);

            } else {

              pro.showMessage();

            }
          }
        }));

        menu.append(new Prepros.gui.MenuItem({
          label: 'Change Output',
          click: function() {


            if (_.isEmpty(scope.multiSelect.files)) {

              scope.changeFileOutput(file.pid, file.id);

            } else {

              pro.showMessage();

            }
          }
        }));

        menu.append(new Prepros.gui.MenuItem({
          type: 'separator'
        }));

        menu.append(new Prepros.gui.MenuItem({
          label: 'Reset File Settings',
          click: function() {

            if (_.isEmpty(scope.multiSelect.files)) {

              scope.resetFileSettings(file.pid, file.id, false);

            } else {

              pro.showMessage();
            }
          }
        }));

        element.on('contextmenu', function(e) {

          e.preventDefault();

          menu.remove(autoCompileItem);

          var label = ((file.config.autoCompile) ? 'Disable' : 'Enable') + ' Auto Compile';

          if (!_.isEmpty(scope.multiSelect.files)) label = 'Toggle Auto Compile';

          autoCompileItem = new Prepros.gui.MenuItem({
            label: label,
            click: function() {

              if (_.isEmpty(scope.multiSelect.files)) {

                scope.$apply(function() {
                  scope.toggleAutoCompile(file.pid, file.id);
                });

              } else {

                pro.showMessage();
              }
            }
          });

          menu.insert(autoCompileItem, 3);

          menu.popup(e.pageX, e.pageY);
        });
      }
    };

  }
]);
