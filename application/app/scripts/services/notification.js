/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('notification', function (config, $location, $rootScope) {

    'use strict';

    var path = require('path');

    var notificationWindow, log = [];

    var createNotificationWindow = function() {

        var notificationPath = 'file:///' + path.normalize(config.basePath + '/notification.html');

        var options = {
            x: window.screen.availWidth - 360,
            y: -1000,
            width: 350,
            height: 100,
            frame: false,
            toolbar: false,
            resizable: false,
            show: false,
            show_in_taskbar: false
        };

        notificationWindow = require('nw.gui').Window.open(notificationPath, options);

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
    };

    //Create initial window
    createNotificationWindow();

    function openNotificationWindow(data) {

        if (notificationWindow) {

            notificationWindow.emit('updateNotification', data);

        } else {

            createNotificationWindow();

            notificationWindow.on('loaded', function() {
                notificationWindow.emit('updateNotification', data);
            });
        }
    }

    function error(name, message, details) {

        log.unshift({name: name, message: message, details: details, type: 'error', date: new Date().toISOString()});

        log = (log.length >= 20) ? log.slice(0, 19) : log;

        $rootScope.$broadcast('logUpdate');

        if (config.getUserOptions().enableErrorNotifications) {

            var data = {
                name: name,
                message: message,
                type: 'error',
                time: config.getUserOptions().notificationTime
            };

            if(config.getUserOptions().notificationDetails) {
                data.details = details;
            }

            openNotificationWindow(data);
        }
    }

    //Function to success notification
    var success = function (name, message, details) {

        log.unshift({name: name, message: message, details: details, type: 'success', date: new Date().toISOString()});

        log = (log.length >= 20) ? log.slice(0, 19) : log;

        $rootScope.$broadcast('logUpdate');

        if (config.getUserOptions().enableSuccessNotifications) {

            var data = {
                name: name,
                message: message,
                type: 'success',
                time: config.getUserOptions().notificationTime
            };

            openNotificationWindow(data);
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
