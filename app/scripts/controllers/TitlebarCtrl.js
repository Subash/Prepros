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

    //Help Link
    $scope.help = function () {

        utils.openBrowser(config.online.helpUrl);

    };

    //Open about window on click
    var aboutWindow;
    $scope.openAboutWindow = function () {

        if (aboutWindow) {

            aboutWindow.show();
            aboutWindow.focus();

        } else {

            var aboutPath = 'file:///' + path.normalize(config.basePath + '/html/about.html');

            aboutWindow = require('nw.gui').Window.open(aboutPath, {
                position: 'center',
                width: 500,
                height: 400,
                frame: true,
                toolbar: false,
                icon: 'app/assets/img/icons/128.png',
                resizable: false
            });

            aboutWindow.on('close', function () {
                aboutWindow.close(true);
                aboutWindow = null;
            });
        }

        //Close about window when main window is closed
        require('nw.gui').Window.get().on('close', function () {

            if (aboutWindow) {
                aboutWindow.close();
            }

        });
    };


    //Open Log window
    var logWindow;
    $scope.openLogWindow = function () {

        if (logWindow) {

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
                logWindow.close(true);
                logWindow = null;
            });
        }

        //Close log window when main window close
        require('nw.gui').Window.get().on('close', function () {

            if (logWindow) {
                logWindow.close();
            }

        });
    };

    //Open Options Window
    var optionsWindow;
    $scope.openOptionsWindow = function () {

        //Inject config object to global so options window can read it
        global.userConfig = config.getUserOptions();

        if (optionsWindow) {

            optionsWindow.show();
            optionsWindow.focus();

        } else {

            var optionsPath = 'file:///' + path.normalize(config.basePath + '/html/options.html');

            optionsWindow = require('nw.gui').Window.open(optionsPath, {
                position: 'center',
                width: 600,
                height: 660,
                frame: true,
                toolbar: false,
                icon: 'app/assets/img/icons/128.png',
                resizable: false
            });

            optionsWindow.on('close', function () {
                config.saveUserOptions(global.userConfig);
                optionsWindow.close(true);
                optionsWindow = null;
            });
        }

        //Close options window when main window is closed
        require('nw.gui').Window.get().on('close', function () {

            if (optionsWindow) {
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
    $scope.goWebsite = function(){

        utils.openBrowser(config.online.url);

    };

    $.ajaxSetup({
        cache: false
    });

    $scope.appUpdate = false;

    $.getJSON(config.online.updateFileUrl, {version: config.version}).done(function(data) {

        if(config.version !== data[0].version){

            $scope.appUpdate = true;

            if(!$scope.$$phase){
                $scope.$apply();
            }
        }
    });
});