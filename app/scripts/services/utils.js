/*jshint browser: true, node: true*/
/*global prepros, $, _ */
prepros.factory('utils', function (config) {

	'use strict';

	var md5 = require('MD5');

	function id(string){

		return md5(string.toLowerCase()).substr(8,8);
	}

    //Node webkit api
    var nw = {
        gui: require('nw.gui'),
        window: require('nw.gui').Window.get()
    };

    //Developer tools in development mode
    if(config.debug){

        window.addEventListener('keydown', function (e) {
            if (e.keyIdentifier === 'F12') {
                nw.window.showDevTools();
            }
        });
    }

    //Shows loading overlay
    function showLoading(yn){

        if(yn){

           $('body').append('<div class="loading-overlay"><div class="container"><div class="loading-icon icomoon-spinner"></div></div></div>');

        } else {

            _.delay(function(){
                $('body .loading-overlay').fadeOut(200, function(){
                    $(this).remove();
                });
            }, 200);
        }
    }


	return {
        nw: nw,
		id: id,
        showLoading: showLoading
	};
});