/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Backbone */
prepros.factory('utils', [

    '$http',
    'config',

    function ($http,config) {

        'use strict';

        var md5 = require('MD5'),
            path = require('path'),
            fs = require('fs-extra');

        function id(string) {

            return md5(string.toLowerCase().replace(/\\/gi, '/')).substr(8, 8);
        }

        //Backbone Notifier
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
            offsetY: 100,	// distance between the notifications and the top/bottom edge (default: 0)
            fadeInMs: 500,	// duration (milliseconds) of notification's fade-in effect (default: 500)
            fadeOutMs: 500,	// duration (milliseconds) of notification's fade-out effect (default: 500)
            position: 'top',// default notifications position ('top' / 'center' / 'bottom')
            zIndex: 10000,	// minimal z-index for notifications
            screenOpacity: 0.5,// opacity of dark screen background that goes behind for modals (0 to 1)
            width: undefined // notification's width ('auto' if not set)
        });

        //Shows loading overlay
        function showLoading() {
            notifier.info({
                message: "Loading...",
                destroy: true,
                loader: true
            });
        }

        //Hide loading animation
        function hideLoading() {
            notifier.destroyAll();
        }

        //Open Browser
        function openBrowser(url) {

            require('nw.gui').Shell.openExternal(url);

        }

        //Check update
        function checkUpdate(success, fail) {

            var params = {};
            var os = require('os');

            params.os_platform = os.platform();
            params.os_arch = os.arch();
            params.os_release = os.release();
            params.app_version = config.version;

            var opt = {
                method: 'get',
                url: config.online.updateFileUrl,
                cache: false,
                params: params
            };

            var checker = $http(opt);

            checker.success(function (data) {

                if (config.version !== data.version) {

                    success({
                        available: true,
                        version: data.version,
                        date: data.releaseDate
                    });
                } else {
                    success({
                        available: false,
                        version: config.version,
                        date: data.releaseDate
                    });
                }
            });

            checker.error(function () {
                if (fail) {
                    fail();
                }
            });
        }

        function isFileInsideFolder(folder, file) {

            return file.toLowerCase().indexOf(folder.toLowerCase()) === 0;
        }

        function readDirs(dir, cb) {

            var f = [];

            function get(dir) {

                var files = fs.readdirSync(dir);

                files.forEach(function (file) {

                    var fp = dir + path.sep + file;

                    if (fs.statSync(fp).isDirectory()) {

                        get(fp);

                    } else {

                        f.push(fp);
                    }
                });
            }

            try {

                get(dir);

            } catch (e) {

                return cb(e);

            }

            cb(null, f);
        }

        return {
            id: id,
            showLoading: showLoading,
            hideLoading: hideLoading,
            openBrowser: openBrowser,
            checkUpdate: checkUpdate,
            notifier: notifier,
            isFileInsideFolder: isFileInsideFolder,
            readDirs: readDirs
        };
    }
]);