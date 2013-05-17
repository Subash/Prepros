/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _, $*/

//Title Bar controls
prepros.controller('TitlebarCtrl', function ($scope, config) {

    'use strict';

    //Support Author Link
    $scope.supportAuthor = function () {

        require('child_process').spawn('explorer', [config.online.loveUrl], {detached: true});

    };


    //Open about window on click
    var aboutWindow;
    $scope.openAboutWindow = function () {

        //Inject config object to global so about window can read it
        global.config = config;

        if (typeof(aboutWindow) === "object") {
            aboutWindow.show();
            aboutWindow.focus();
        } else {
            aboutWindow = require('nw.gui').Window.open("file:///" + config.basePath + '\\html\\about.html', {
                position: 'center',
                width: 500,
                height: 590,
                frame: true,
                toolbar: false,
                icon: 'app/assets/img/icons/128.png',
                resizable: true
            });

            aboutWindow.on('close', function () {
                this.close(true);
                aboutWindow = undefined;
            });
        }

        //Close about window when main window is closed
        require('nw.gui').Window.get().on('close', function () {

            if (typeof(aboutWindow) === 'object') {
                aboutWindow.close();
            }
        });
    };


    //Open Log window
    var logWindow;
    $scope.openLogWindow = function () {

        if (typeof(logWindow) === 'object') {
            logWindow.focus();
            logWindow.show();
        } else {
            logWindow = require('nw.gui').Window.open("file:///" + config.basePath + '\\html\\log.html', {
                position: 'center',
                width: 800,
                height: 500,
                frame: true,
                toolbar: false,
                icon: 'app/assets/img/icons/128.png',
                resizable: false
            });

            logWindow.on('close', function () {
                this.close(true);
                logWindow = undefined;
            });
        }

        //Close log window when main window close
        require('nw.gui').Window.get().on('close', function () {

            if (typeof(logWindow) === 'object') {
                logWindow.close();
            }

        });
    };

    //Open Options Window
    var optionsWindow;
    $scope.openOptionsWindow = function () {

        //Inject config object to global so options window can read it
        global.userConfig = config.user;

        if (typeof(optionsWindow) === "object") {
            optionsWindow.show();
            optionsWindow.focus();
        } else {
            optionsWindow = require('nw.gui').Window.open("file:///" + config.basePath + '\\html\\options.html', {
                position: 'center',
                width: 600,
                height: 540,
                frame: true,
                toolbar: false,
                icon: 'app/assets/img/icons/128.png',
                resizable: false
            });

            optionsWindow.on('close', function () {
                config.user = global.userConfig;
                config.saveOptions();
                this.close(true);
                optionsWindow = undefined;
            });
        }

        //Close options window when main window is closed
        require('nw.gui').Window.get().on('close', function () {

            if (typeof(optionsWindow) === 'object') {
                optionsWindow.close();
            }

        });

    };


    //Minimize app to tray by hiding the window
    $scope.toTray = function(){
        require('nw.gui').Window.get().hide();
    };

    //Minimize app
    $scope.minimize = function(){
        require('nw.gui').Window.get().minimize();
    };

    //Close App
    $scope.close = function(){
        require('nw.gui').Window.get().close();
    };

    //Update Checker

    $scope.appUpdate = false;

    $scope.goWebsite = function(){
        require('child_process').spawn('explorer', [config.online.url], {detached: true});
    };

    $.ajaxSetup({
        cache: false
    });

    $.getJSON(config.online.updateFileUrl).done(function(data) {

        if(config.version !== data[0].version){

            $scope.appUpdate = true;

            if(!$scope.$$phase){
                $scope.$apply();
            }
        }
    });
});