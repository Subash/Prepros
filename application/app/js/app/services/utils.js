/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _ */
prepros.factory('utils', function (config, $http) {

    'use strict';

    var md5 = require('MD5');

    function id(string) {

        return md5(string.toLowerCase()).substr(8, 8);
    }

    //Shows loading overlay
    function showLoading() {

        $('body').append('<div class="loading-overlay"><div class="container"><div class="loading-icon icomoon-spinner"></div></div></div>');
    }

    //Hide loading animation
    function hideLoading() {

        _.delay(function () {
            $('body .loading-overlay').fadeOut(200, function () {
                $(this).remove();
            });
        }, 200);
    }

    //Open Browser
    function openBrowser(url) {

        require('nw.gui').Shell.openExternal(url);

    }

    //Check update
    function checkUpdate(success, fail) {

        var opt = {method: 'get', url: config.online.updateFileUrl, cache: false};

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

    return {
        id: id,
        showLoading: showLoading,
        hideLoading: hideLoading,
        openBrowser: openBrowser,
        checkUpdate: checkUpdate
    };
});