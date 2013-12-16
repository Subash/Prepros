/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, Prepros, $, angular, _*/

prepros.factory("update", [ "$http", function ($http) {

	"use strict";

	function checkUpdate(success, fail) {

		var params = {};
		var os = require('os');

		params.os_platform = os.platform();
		params.os_arch = os.arch();
		params.os_release = os.release();
		params.app_version = Prepros.VERSION;
		params.screenHeight = window.screen.availHeight;
		params.screenWidth = window.screen.availWidth;
		params.isPro = Prepros.IS_PRO;

        var updateFileUrl = (Prepros.IS_PRO)? Prepros.urls.proUpdateFile: Prepros.urls.updateFile;

		var opt = {
			method: 'get',
			url: updateFileUrl,
			cache: false,
			params: params
		};

		var checker = $http(opt);

		checker.success(function (data) {

            var available = false;

            if(Prepros.VERSION !== data.version) {

                available = true;

            }

			if (available) {

				success({
					available: true,
					version: data.version,
					date: data.releaseDate,
					updateUrl: data.updateUrl
				});

			} else {

				success({
					available: false
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
		checkUpdate: checkUpdate
	};

}]);