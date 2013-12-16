/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _, $, Prepros*/

//Title Bar controls
prepros.controller('TitlebarCtrl', [

	'$scope',

	function ($scope) {

		'use strict';

		//Minimize to tray by hiding the window
		$scope.minimizeToTray = function() {
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

		$scope.maximizeUnmaximize = function() {

            if(Prepros.Window.x <= 0 && Prepros.Window.height >= window.screen.availHeight) {
                    Prepros.Window.unmaximize();
            } else {
                Prepros.Window.maximize();
            }
		};
	}

]);