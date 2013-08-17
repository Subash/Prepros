/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _, $*/

//Title Bar controls
prepros.controller('TitlebarCtrl', function ($scope, config, utils, projectsManager) {

    'use strict';

    var path = require('path');

    //Support Author Link
    $scope.supportAuthor = function () {

        utils.openBrowser(config.online.loveUrl);

    };

    //Minimize app to tray by hiding the window
    $scope.toTray = function () {
        require('nw.gui').Window.get().hide();
    };

    //Minimize app
    $scope.minimize = function () {
        require('nw.gui').Window.get().minimize();
    };

    //Close App
    $scope.close = function () {
        require('nw.gui').App.closeAllWindows();
    };

    //Update Checker
    $scope.goWebsite = function () {

        utils.openBrowser(config.online.url);

    };

    utils.checkUpdate(function (data) {

        if (data.available) {
            $scope.appUpdate = true;
        }

    });

    $scope.addProject = function () {

        //Function to add new project
        var elm = $('<input type="file" nwdirectory>');

        elm.trigger('click');

        $(elm).on('change', function (e) {

            var file = e.currentTarget.files[0].path;

            //Must notify scope after async operation
            $scope.$apply(function () {
                projectsManager.addProject(file);
            });

        });
    };

    //Open Options Window
    var optionsWindow;
    $scope.openOptionsWindow = function () {

        if (optionsWindow) {

            optionsWindow.show();
            optionsWindow.focus();

        } else {

            var optionsPath = 'file:///' + path.normalize(config.basePath + '/options.html');

            optionsWindow = require('nw.gui').Window.open(optionsPath, {
                position: 'center',
                width: 600,
                height: 470,
                frame: true,
                toolbar: false,
                icon: 'app/assets/img/icons/128.png',
                resizable: false
            });

            optionsWindow.on('loaded', function () {
                optionsWindow.emit('loadAppConfig', config);
            });

            optionsWindow.on('saveOptions', function (data) {
                config.saveUserOptions(data);
            });

            optionsWindow.on('closed', function () {
                optionsWindow.removeAllListeners();
                optionsWindow = null;
            });
        }
    };
});