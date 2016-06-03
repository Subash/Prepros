/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros, Prepros*/

prepros.factory('notification', [

  '$location',
  '$rootScope',
  'config',

  function($location, $rootScope, config) {

    'use strict';

    var path = require('path');

    var tnotify = require('terminal-notifier-plus');

    var notificationWindow;

    var _createWindow = function() {

      var notificationPath = 'file:///' + path.normalize(config.basePath + '/notif.html');

      var options = {
        x: window.screen.availWidth - 325,
        y: window.screen.availHeight - 100,
        width: 320,
        height: 100,
        frame: false,
        toolbar: false,
        resizable: false,
        show: false,
        show_in_taskbar: false
      };

      if (Prepros.PLATFORM_MAC || Prepros.PLATFORM_LINUX) {
        options.y = 10;
      }

      notificationWindow = Prepros.gui.Window.open(notificationPath, options);

      notificationWindow.on('showLog', function() {

        $rootScope.$apply(function() {
          $location.path('/log');
        });

        Prepros.Window.show();
        Prepros.Window.focus();
      });

      notificationWindow.once('closed', function() {
        notificationWindow.removeAllListeners();
        notificationWindow = null;
      });

      Prepros.gui.Window.get().setShowInTaskbar(true);
    };

    if (Prepros.PLATFORM_WINDOWS) {

      //Create initial window
      _createWindow();

    }


    function _showNotification(data) {

      if (Prepros.PLATFORM_WINDOWS) {

        if (notificationWindow) {

          notificationWindow.emit('updateNotification', data);

        } else {

          _createWindow();

          notificationWindow.on('loaded', function() {
            notificationWindow.emit('updateNotification', data);
          });
        }

      } else {

        tnotify.notify({
          title: data.name,
          message: data.message,
          activate: 'com.alphapixels.prepros',
          sender: 'com.alphapixels.prepros'
        });

      }


    }

    //Function to show error notification
    function error(name, message, details) {

      if (config.getUserOptions().enableErrorNotifications) {

        var data = {
          name: name,
          message: message,
          type: 'error',
          time: config.getUserOptions().notificationTime
        };

        if (config.getUserOptions().notificationDetails) data.details = details;

        _showNotification(data);
      }
    }

    //Function to show success notification
    var success = function(name, message, details) {

      if (config.getUserOptions().enableSuccessNotifications) {

        var data = {
          name: name,
          message: message,
          type: 'success',
          time: config.getUserOptions().notificationTime
        };

        if (config.getUserOptions().notificationDetails) data.details = details;

        _showNotification(data);
      }
    };

    //Instantiate Backbone Notifier
    var notifier = new Backbone.Notifier({
      theme: 'clean',
      type: 'info',
      types: ['warning', 'error', 'info', 'success'],
      modal: true,
      ms: false,
      offsetY: 100,
      position: 'top',
      zIndex: 10000,
      screenOpacity: 0.5,
      fadeInMs: 0,
      fadeOutMs: 0,
      destroy: true
    });

    var showInlineNotification = function(details) {

      if (details.destroy === undefined) {

        details.destroy = true;

      }

      return notifier.notify(details);

    };

    //Shows loading overlay
    function showLoading(message) {

      return notifier.info({
        message: (message) ? message : "Loading..... :) ",
        loader: true
      });
    }

    //Hide loading animation
    function hideLoading() {
      notifier.destroyAll();
    }

    return {
      error: error,
      success: success,
      showInlineNotification: showInlineNotification,
      showLoading: showLoading,
      hideLoading: hideLoading
    };
  }
]);
