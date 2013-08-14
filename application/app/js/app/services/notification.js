/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros */

prepros.factory('notification', function (config, $location, $rootScope) {

    'use strict';

    var path = require('path');

    var notificationWindow, log = [];

    function openNotificationWindow(data) {

        if (notificationWindow) {

            notificationWindow.emit('updateNotification', data);

        } else {

            var notificationPath = 'file:///' + path.normalize(config.basePath + '/templates/notification.html');

            var options = {
                x: window.screen.availWidth - 410,
                y: window.screen.availHeight - 110,
                width: 400,
                height: 100,
                frame: false,
                toolbar: false,
                resizable: false,
                show: false,
                show_in_taskbar: false
            };

            if (process.platform !== 'win32') {
                options.y = 30;
            }

            notificationWindow = require('nw.gui').Window.open(notificationPath, options);

            notificationWindow.on('loaded', function () {
                notificationWindow.emit('updateNotification', data);
            });

            notificationWindow.on('showLog', function () {
                $rootScope.$apply(function () {
                    $location.path('/log');
                });
                require('nw.gui').Window.get().show();
            });

            notificationWindow.on('closed', function () {
                notificationWindow.removeAllListeners();
                notificationWindow = null;
            });
        }
    }

    function error(name, message, details) {

        log.unshift({name: name, message: message, details: details, type: 'error', date: new Date().toISOString()});

        log = (log.length >= 20) ? log.slice(0, 19) : log;

        $rootScope.$broadcast('logUpdate');

        if (config.getUserOptions().enableErrorNotifications) {

            openNotificationWindow({name: name, message: message, type: 'error'});
        }
    }

    //Function to success notification
    var success = function (name, message, details) {

        log.unshift({name: name, message: message, details: details, type: 'success', date: new Date().toISOString()});

        log = (log.length >= 20) ? log.slice(0, 19) : log;

        $rootScope.$broadcast('logUpdate');

        if (config.getUserOptions().enableSuccessNotifications) {

            openNotificationWindow({name: name, message: message, type: 'success'});
        }
    };

    var clearLog = function() {
        log = [];
        $rootScope.$broadcast('logUpdate');
    };

    var getLog = function() {
        return log;
    };

    return {
        error: error,
        success: success,
        getLog: getLog,
        clearLog: clearLog
    };
});
