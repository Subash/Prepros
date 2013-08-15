/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, Backbone */

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

    //Instantiate Backbone Notifier
    var notifier = new Backbone.Notifier({	// defaults
        el: '.wrapper', // container for notification (default: 'body')
        baseCls: 'notifier',// css classes prefix, should match css file. Change to solve conflicts.
        theme: 'clean',// default theme for notifications (available: 'plastic'/'clean').
        types: ['warning', 'error', 'info', 'success'],// available notification styles
        type: null,// default notification type (null/'warning'/'error'/'info'/'success')
        dialog: false,	// whether display the notification with a title bar and a dialog style.
        modal: true,	// whether to dark and block the UI behind the notification (default: false)
        closeBtn: false, // whether to display an enabled close button on notification
        ms: false,	// milliseconds before hiding (null || false => no timeout) (default: 10000)
        hideOnClick: true,// whether to hide the notifications on mouse click (default: true)
        loader: false,	// whether to display loader animation in notifications (default: false)
        destroy: false,// notification or selector of notifications to hide on show (default: false)
        opacity: 1,	// notification's opacity (default: 1)
        offsetY: 50,	// distance between the notifications and the top/bottom edge (default: 0)
        fadeInMs: 500,	// duration (milliseconds) of notification's fade-in effect (default: 500)
        fadeOutMs: 500,	// duration (milliseconds) of notification's fade-out effect (default: 500)
        position: 'top',// default notifications position ('top' / 'center' / 'bottom')
        zIndex: 10000,	// minimal z-index for notifications
        screenOpacity: 0.5,// opacity of dark screen background that goes behind for modals (0 to 1)
        width: undefined // notification's width ('auto' if not set)
    });

    return {
        error: error,
        success: success,
        getLog: getLog,
        clearLog: clearLog,
        notifier: notifier
    };
});
