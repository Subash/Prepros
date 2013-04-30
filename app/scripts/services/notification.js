/*jshint browser: true, node: true*/
/*global prepros */

prepros.factory('notification', function (config, utils) {

    'use strict';

    //Push log to global so it can be viewed from another window
    global.preprosLog = [];

    var notificationWindow;

	function error(name, details){

        global.logElement = $('.title-bar .controls .log');

        global.preprosLog.push({name: name, details: details, type: 'error'});

        global.preprosNotification = {name: name, details: details, type: 'error'};

        //Hack to update log
        if(global.logScope){
            global.logScope.$apply();
        }

        if(config.user.enableNotifications){

            if(typeof(notificationWindow) === 'object') {
                notificationWindow.reload();
                notificationWindow.focus();
                notificationWindow.show();

            } else {

                notificationWindow = utils.nw.gui.Window.open("file:///" + config.basePath + '\\html\\notification.html', {
                    x: window.screen.availWidth-400,
                    y: window.screen.availHeight-70,
                    width: 400,
                    height: 70,
                    frame: false,
                    toolbar: false,
                    resizable: false,
                    show: false,
                    show_in_taskbar: false
                });

                notificationWindow.on('close', function(){
                    this.close(true);
                    notificationWindow = undefined;
                });
            }
        }

	}

    var logWindow;

    $('.title-bar .controls .log').on('click', function () {

        if(typeof(logWindow) === 'object') {
            logWindow.focus();
            logWindow.show();
        } else {
            logWindow = utils.nw.gui.Window.open("file:///" + config.basePath + '\\html\\log.html', {
                position: 'center',
                width: 800,
                height: 500,
                frame: true,
                toolbar: false,
                icon: 'app/assets/img/icons/128.png',
                resizable: false
            });

            logWindow.on('close', function(){
                this.close(true);
                logWindow = undefined;
            });
        }

    });

    //Save data on window close
    utils.nw.window.on('close', function () {

        if(typeof(logWindow) === 'object') {
            logWindow.close();
        }

    });

    return {
		error: error
    };

});
