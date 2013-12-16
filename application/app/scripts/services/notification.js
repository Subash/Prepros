/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros, Prepros*/

prepros.factory('notification', [

    '$location',
    '$rootScope',
    'config',

    function ($location, $rootScope, config) {

        'use strict';

        var path = require('path');

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

            if(Prepros.PLATFORM_WINDOWS) {
                options.y = 10;
            }

            notificationWindow = Prepros.gui.Window.open(notificationPath, options);

            notificationWindow.on('showLog', function () {

                $rootScope.$apply(function () {
                    $location.path('/log');
                });

                Prepros.Window.show();
                Prepros.Window.focus();
            });

            notificationWindow.once('closed', function () {
                notificationWindow.removeAllListeners();
                notificationWindow = null;
            });
        };

        //Create initial window
        _createWindow();

        function _showNotification(data) {

            if (notificationWindow) {

                notificationWindow.emit('updateNotification', data);

            } else {

                _createWindow();

                notificationWindow.on('loaded', function() {
                    notificationWindow.emit('updateNotification', data);
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

                if(config.getUserOptions().notificationDetails) data.details = details;

                _showNotification(data);
            }
        }

        //Function to show success notification
        var success = function (name, message, details) {

            if (config.getUserOptions().enableSuccessNotifications) {

                var data = {
                    name: name,
                    message: message,
                    type: 'success',
                    time: config.getUserOptions().notificationTime
                };

                if(config.getUserOptions().notificationDetails) data.details = details;

                _showNotification(data);
            }
        };

        return {
            error: error,
            success: success
        };
    }
]);
