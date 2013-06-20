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

    //Inject function in global so that notification can show log
    global.showLog = function(){

        $rootScope.$apply(function(){
            $location.path('/log');
        });

        require('nw.gui').Window.get().show();
    };


    function openNotificationWindow(){

        if(notificationWindow) {

            notificationWindow.close();
        }

        var notificationPath = 'file:///' + path.normalize(config.basePath + '/html/notification.html');

        notificationWindow = require('nw.gui').Window.open(notificationPath, {
            x: window.screen.availWidth-410,
            y: window.screen.availHeight-110,
            width: 400,
            height: 100,
            frame: false,
            toolbar: false,
            resizable: false,
            show: false,
            show_in_taskbar: false
        });

        notificationWindow.showInactive();

        notificationWindow.on('close', function(){
            this.close(true);
            notificationWindow = null;
        });

        //Close notification window when main window is closed
        require('nw.gui').Window.get().on('close', function () {

            if(notificationWindow) {
                notificationWindow.close();
            }
        });

    }

	function error(name, message, details){

        log.unshift({name: name, message: message, details: details, type: 'error', date: new Date().toISOString()});

        log = (log.length>30)? log.slice(0, 30): log;

        global.preprosNotification = {name: name, message: message, type: 'error'};

        if(config.getUserOptions().enableErrorNotifications){

            openNotificationWindow();
        }
	}

    //Function to success notification
    var success = function(name, message, details){

        log.unshift({name: name, message: message, details: details, type: 'success', date: new Date().toISOString()});

        log = (log.length>30)? log.slice(0, 30): log;

        global.preprosNotification = {name: name, message: message, type: 'success'};

        if(config.getUserOptions().enableSuccessNotifications){

            openNotificationWindow();
        }
    };

    //Clear Log
    var clearLog = function(){
        log = [];
    };

    var getLog = function(){
        return log;
    };

    return {
		error: error,
        success: success,
        clearLog: clearLog,
        getLog: getLog
    };

});
