/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false, curly: false*/
/*global prepros,  _ , $, Prepros*/

//Files List controls
prepros.controller('ProjectCtrl', [

  '$scope',
  '$rootScope',
  'projectsManager',
  'liveServer',
  'pro',
  'utils',
  'compiler',

  function($scope, $rootScope, projectsManager, liveServer, pro, utils, compiler) {

    'use strict';

    var fs = require('fs-extra');
    var path = require('path');
    var url = require('url');

    $scope.toggleFileWatcher = function(id) {
      $scope.projects[id].config.watch = !$scope.projects[id].config.watch;
    };

    $scope.openProjectFolder = function(id) {
      Prepros.gui.Shell.openItem($scope.projects[id].path);
    };

    $scope.openProjectPreview = function(pid) {

      if (!Prepros.IS_PRO && $scope.projects[pid].config.useCustomServer) {

        Prepros.gui.Shell.openItem($scope.projects[pid].config.customServerUrl);

      } else {

        var lurl = liveServer.getLiveUrl(pid);

        if (url.parse($scope.projects[pid].config.customServerUrl).path) {

          lurl += url.parse($scope.projects[pid].config.customServerUrl).path;
        }

        Prepros.gui.Shell.openItem(lurl);
      }
    };

    $scope.copyProjectPreviewUrl = function(pid) {

      if (!Prepros.IS_PRO && $scope.projects[pid].config.useCustomServer) {

        Prepros.gui.Clipboard.get().set($scope.projects[pid].config.customServerUrl, 'text');

      } else {

        var lurl = liveServer.getLiveUrl(pid);

        if (url.parse($scope.projects[pid].config.customServerUrl).path) {

          lurl += url.parse($scope.projects[pid].config.customServerUrl).path;
        }

        Prepros.gui.Clipboard.get().set(lurl, 'text');
      }
    };

    $scope.createProjectConfigFile = function(id) {

      pro.showMessage();
    };

    $scope.openRemoteInspect = function() {

      pro.showMessage();
    };

    $scope.optimizeAllImages = function(pid) {
      pro.showMessage();
    };

    $scope.refreshProject = function(id) {
      projectsManager.refreshProjectFiles(id);
    };

    $scope.pushProjectToRemote = function(id) {
      pro.showMessage();
    };

    $scope.removeProject = function(pid) {


      var confirmMsg = utils.notifier.notify({
        type: 'warning',
        message: 'Are You sure you want to remove this project ?',
        buttons: [{
          'data-role': 'ok',
          text: 'Yes'
        }, {
          'data-role': 'cancel',
          text: 'Cancel'
        }],
        destroy: true
      });

      confirmMsg.on('click:ok', function() {
        $rootScope.$apply(function() {
          projectsManager.removeProject(pid);
          confirmMsg.destroy();
        });
      });

      confirmMsg.on('click:cancel', function() {
        confirmMsg.destroy();
      });
    };

    $scope.compileAllFiles = function(pid) {

      _.each($scope.projects[pid].files, function(file) {

        compiler.compile(file.pid, file.id);

      });

    };

    $scope.compileMultiSelectFiles = function() {

      pro.showMessage();

    };

    $scope.addProject = function() {

      //Function to add new project
      var elm = $('<input type="file" nwdirectory>');

      elm.trigger('click');

      $(elm).on('change', function(e) {

        var file = e.currentTarget.files[0].path;

        //Must notify scope after async operation
        $scope.$apply(function() {
          projectsManager.addProject(file);
        });

      });
    };
  }
]);
