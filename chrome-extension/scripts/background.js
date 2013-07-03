
/*global chrome*/

Array.prototype.contains = function(item) {

    'use strict';

    var i = this.length;
    while (i--) {
        if (this[i] === item) {
            return true;
        }
    }
    return false;
};

function parseUrl(string){

	'use strict';

	var parser = document.createElement('a');

	parser.href = string;

	return parser;
}

var socketRunning = false,
	liveUrls = [];

function startSocket(callback){

	'use strict';

	var socket = new WebSocket('ws://localhost:5656');

	socket.addEventListener('message', function(evt){

        liveUrls = [];

        JSON.parse(evt.data).urls.forEach(function(url) {

            liveUrls.push(url);

            chrome.tabs.getAllInWindow(null, function(tabs){

                tabs.forEach(function(tab){

                    if(liveUrls.contains(parseUrl(tab.url).protocol + '//' + parseUrl(tab.url).host)) {

                        chrome.tabs.reload(tab.id, { bypassCache: true });

                    }
                });
            });

        });
	});

	socket.addEventListener('open', function(){

		socketRunning = true;

        callback();
		
	});

	socket.addEventListener('close', function(){

		socketRunning = false;

	});
}


//function to start refreshing tabs
function startRefreshing(tab){

	'use strict';

    var callback = function() {

        var parsedUrl = parseUrl(tab.url).protocol + '//' + parseUrl(tab.url).host;

        if(tab.url.match(/^file:\/\/\//gi) || liveUrls.contains(parsedUrl)) {

            chrome.tabs.executeScript(tab.id, {file: 'scripts/refresh.js'});
        }

    };

	if(!socketRunning) {

		startSocket(callback);

	} else {

        callback();
    }


}

//Try to run refreshing on tab update
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

	'use strict';

    if(tab.status === 'complete') {
        startRefreshing(tab);
    }

});