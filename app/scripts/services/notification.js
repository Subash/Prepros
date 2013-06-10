/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros */

prepros.factory('notification', function (config) {

    'use strict';

    var path = require('path');

    //Push log to global so it can be viewed from another window
    global.preprosLog = [];

    var notificationWindow;

    function openNotificationWindow(){

        if(typeof(notificationWindow) === 'object') {

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
            notificationWindow = undefined;
        });

        //Close notification window when main window is closed
        require('nw.gui').Window.get().on('close', function () {

            if(typeof(notificationWindow) === 'object') {
                notificationWindow.close();
            }
        });

    }

	function error(name, message, details){

        global.preprosLog.unshift({name: name, message: message, details: details, type: 'error', date: new Date().toISOString()});

        if(global.preprosLog.length>30) {

            global.preprosLog = global.preprosLog.slice(0, 30);

        }

        global.preprosNotification = {name: name, message: message, type: 'error'};

        //Hack to update log
        if(global.logScope){
            global.logScope.$apply();
        }

        if(config.getUserOptions().enableErrorNotifications){

            openNotificationWindow();
        }
	}

    //Function to success notification
    var success = function(name, message, details){

        global.preprosLog.unshift({name: name, message: message, details: details, type: 'success', date: new Date().toISOString()});

        if(global.preprosLog.length>30) {

            global.preprosLog = global.preprosLog.slice(0, 30);

        }

        global.preprosNotification = {name: name, message: message, type: 'success'};

        //Hack to update log
        if(global.logScope){
            global.logScope.$apply();
        }

        if(config.getUserOptions().enableSuccessNotifications){

            openNotificationWindow();
        }
    };

    return {
		error: error,
        success: success
    };

});
