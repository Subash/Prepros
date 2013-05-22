// prepros.js - Prepros's module
// author: kushalpandya

(function(window, _) {
    'use strict';

    var window = window;
    var tabs = require('sdk/tabs');
    
    var socketRunning = false;
    var liveUrls = [];
    var WebSocket = window.WebSocket || window.MozWebSocket;


    var getLiveUrl = function(url) {        
        if(url.match(/^http:\/\/localhost:3738\//))
        {
            return url.substr(0,31);
    	}
        else
        {
    		return parseUrl(url).protocol + '//' + parseUrl(url).host;
    	}
    };

    var parseUrl =  function(string) {
        var parser = document.createElement('a');
    	parser.href = string;
    	return parser;
    };
    
    //function to stop refreshing tabs
    var stopRefreshing = function(url) {
        _.each(tabs, function(tab) {
    		if( url === getLiveUrl(tab.url) )
            {
    			tab.open(tab.url);
    		}
    	});
    };

    
    var startSocket = function() {
        if (!WebSocket)
        {
          console.error("Prepros is disabled because the browser does not support WebSocket API");
          return;
        }
        
        var socket = new WebSocket('ws://localhost:3738');

        socket.addEventListener('message', function(evt) {
		    var newUrls = JSON.parse(evt.data).urls;

    		_.each(liveUrls, function(url){
    			//If url is removed from refresh list
    			if(!_.contains(newUrls, url))
                {
    				liveUrls = _.reject(liveUrls, function(ur){
    					return ur === url;
    				});
    				stopRefreshing(url);
    			}
		    });

    		//Start refreshing each url
    		_.each(newUrls, function(url) {
    			if(url)
                {
    				liveUrls.push(getLiveUrl(url));
    			}    
    		});
	    });
        
    	socket.addEventListener('open', function() {    
    		socketRunning = true;
    	});

    	socket.addEventListener('close', function(){
    		socketRunning = false;
    	});
    };
    
    _.each(tabs, function(tab) {
        tab.on('ready', function(tab){
            if(!socketRunning){    
                startSocket();
            }
        });
    });
    
    startSocket();
})(window, _);