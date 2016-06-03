/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros, $, _, Mousetrap, Prepros*/

//Directive for keyboard shortcuts
prepros.directive('keyboardShortcuts', [

  'pro',

  function(pro) {

    'use strict';

    return {
      restrict: 'A',
      link: function(scope) {

        var keysDisabled = function() {

          return scope.DISABLE_KEYBOARD_SHORTCUTS;
        };


        //Select All
        Mousetrap.bind(['ctrl+a', 'command+a'], function() {

          if (keysDisabled()) return false;

          scope.clearMultiSelect();

          if (scope.routePath === 'IMAGE_OPTIMIZATION') {

            scope.$apply(function() {

              _.each(scope.selectedProjectImages, function(img) {

                scope.addMultiSelectImage(img.pid, img.id);

              });

            });


          } else if (scope.routePath === 'FILES') {

            scope.$apply(function() {

              _.each(scope.selectedProjectFiles, function(f) {

                scope.addMultiSelectFile(f.pid, f.id);

              });

            });

          }

          return false;
        });

        //New Project
        Mousetrap.bind(['ctrl+n', 'command+n'], function() {

          if (keysDisabled()) return false;

          scope.addProject();

          return false;
        });

        //Refresh Project Files
        Mousetrap.bind(['ctrl+r', 'f5', 'command+r'], function() {

          if (keysDisabled()) return false;

          if (scope.selectedProject.id) {

            scope.$apply(function() {

              scope.refreshProject(scope.selectedProject.id);

            });

          }
          return false;
        });

        //Open Live Url
        Mousetrap.bind(['ctrl+l', 'command+l'], function() {

          if (keysDisabled()) return false;

          if (scope.selectedProject.id) {

            scope.openProjectPreview(scope.selectedProject.id);
          }

          return false;
        });

        //Copy Live Preview Url
        Mousetrap.bind(['ctrl+shift+l', 'command+shift+l'], function() {

          if (keysDisabled()) return false;

          if (scope.selectedProject.id) {

            scope.copyProjectPreviewUrl(scope.selectedProject.id);
          }

          return false;
        });

        //Remote inspect url
        Mousetrap.bind(['ctrl+i', 'command+i'], function() {

          if (keysDisabled()) return false;

          scope.openRemoteInspect();

          return false;
        });

        //Remove Project
        Mousetrap.bind(['ctrl+d', 'command+d'], function() {

          if (keysDisabled()) return false;

          if (scope.selectedProject.id) {

            scope.$apply(function() {
              scope.removeProject(scope.selectedProject.id);
            });

          }
          return false;
        });

        //Push to remote
        Mousetrap.bind(['ctrl+u', 'command+u'], function() {

          if (keysDisabled()) return false;

          if (scope.selectedProject.id) {

            scope.pushProjectToRemote(scope.selectedProject.id);

          }
          return false;
        });

        //Compile file
        Mousetrap.bind(['ctrl+s', 'command+s'], function() {

          if (keysDisabled()) return false;

          if (_.isEmpty(scope.multiSelect.files)) {

            if (scope.selectedFile.id) {

              scope.compile(scope.selectedFile.pid, scope.selectedFile.id);

            }

          } else {

            scope.compileMultiSelectFiles();

          }

          return false;
        });

        //Compile all project files
        Mousetrap.bind(['ctrl+shift+s', 'command+shift+s'], function() {

          if (keysDisabled()) return false;

          if (scope.selectedProject.id) {

            scope.compileAllFiles(scope.selectedProject.id);
          }
          return false;
        });


        //Optmize Selected Image
        Mousetrap.bind(['ctrl+o', 'command+o'], function() {

          if (keysDisabled()) return false;

          if (_.isEmpty(scope.multiSelect.images)) {

            if (scope.selectedImage.id) {

              scope.optimizeImage(scope.selectedImage.pid, scope.selectedImage.id)

            }

          } else {

            if (!Prepros.IS_PRO) return pro.showMessage();

          }

          return false;
        });

        //Optimize All Images
        Mousetrap.bind(['ctrl+shift+o', 'command+shift+o'], function() {

          if (keysDisabled()) return false;

          if (scope.selectedProject.id) {

            scope.$apply(function() {

              scope.optimizeAllImages(scope.selectedProject.id);

            });
          }
          return false;
        });

        //Copy
        Mousetrap.bind(['ctrl+c', 'command+c'], function() {

          if (keysDisabled()) return false;

          if (window.getSelection().toString() !== "") {

            Prepros.gui.Clipboard.get().set(window.getSelection().toString(), 'text');

          }
          return false;
        });


        Mousetrap.bind(['ctrl+shift+x', 'command+shift+x'], function() {

          var sure = window.confirm('Are you sure you want to clear Prepros data and restart it ?');

          if (sure) {

            localStorage.clear();
            Prepros.gui.App.quit(); //Restarting is not really possible yet

          }

          return false;
        });
      }
    };
  }
]);
