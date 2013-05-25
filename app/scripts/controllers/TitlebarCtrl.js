/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _, $*/

//Title Bar controls
prepros.controller('TitlebarCtrl', function ($scope, config, utils) {

    'use strict';

    var path = require('path');

    //Support Author Link
    $scope.supportAuthor = function () {

        utils.openBrowser(config.online.loveUrl);

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

            var aboutPath = 'file:///' + path.normalize(config.basePath + '/html/about.html');

            aboutWindow = require('nw.gui').Window.open(aboutPath, {
                position: 'center',
                width: 500,
                height: 600,
                frame: true,
                toolbar: false,
                icon: 'app/assets/img/icons/128.png',
                resizable: false
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

            var logPath = 'file:///' + path.normalize(config.basePath + '/html/log.html');

            logWindow = require('nw.gui').Window.open(logPath, {
                position: 'center',
                width: 850,
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
        global.userConfig = config.getUserOptions();

        if (typeof(optionsWindow) === "object") {
            optionsWindow.show();
            optionsWindow.focus();
        } else {

            var optionsPath = 'file:///' + path.normalize(config.basePath + '/html/options.html');

            optionsWindow = require('nw.gui').Window.open(optionsPath, {
                position: 'center',
                width: 600,
                height: 580,
                frame: true,
                toolbar: false,
                icon: 'app/assets/img/icons/128.png',
                resizable: false
            });

            optionsWindow.on('close', function () {
                config.saveUserOptions(global.userConfig);
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

        utils.openBrowser(config.online.url);

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