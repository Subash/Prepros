/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ */

//Title Bar controls
prepros.controller('TitlebarCtrl', function ($scope, config) {

    //Support Author Link
    $scope.supportAuthor = function () {

        require('child_process').spawn('explorer', ['http://alphapixels.com/prepros#love'], {detached: true});

    };


    //Open about window on click
    var aboutWindow;
    $scope.openAboutWindow = function () {

        global.preprosAbout = {dependencies: config.dependencies, languages: config.languages, version: config.version};

        if (typeof(aboutWindow) === "object") {
            aboutWindow.show();
            aboutWindow.focus();
        } else {
            aboutWindow = require('nw.gui').Window.open("file:///" + config.basePath + '\\html\\about.html', {
                position: 'center',
                width: 500,
                height: 520,
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
    $scope.openLogWindow = function (event) {

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

        //Push app options to global so options window can get it
        global.preprosOptions = {user: config.user};

        if (typeof(optionsWindow) === "object") {
            optionsWindow.show();
            optionsWindow.focus();
        } else {
            optionsWindow = require('nw.gui').Window.open("file:///" + config.basePath + '\\html\\options.html', {
                position: 'center',
                width: 500,
                height: 300,
                frame: true,
                toolbar: false,
                icon: 'app/assets/img/icons/128.png',
                resizable: false
            });

            optionsWindow.on('close', function () {
                config.user = global.preprosOptions.user;
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
    }
});