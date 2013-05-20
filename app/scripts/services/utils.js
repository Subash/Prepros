/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _ */
prepros.factory('utils', function () {

	'use strict';

	var md5 = require('MD5');

	function id(string){

		return md5(string.toLowerCase()).substr(8,8);
	}

    //Shows loading overlay
    function showLoading(){

        $('body').append('<div class="loading-overlay"><div class="container"><div class="loading-icon icomoon-spinner"></div></div></div>');
    }

    //Hide loading animation
    function hideLoading(){

        _.delay(function(){
            $('body .loading-overlay').fadeOut(200, function(){
                $(this).remove();
            });
        }, 200);
    }

    //Open Browser
    function openBrowser(url){

        require('child_process').spawn('explorer', [ url ], {detached: true});

    }

    var utils =  {
        id: id,
        showLoading: showLoading,
        hideLoading: hideLoading,
        openBrowser: openBrowser
    };

    //Push utils to global so other windows can also use utility functions
    global.utils = utils;

    return utils;
});