
/*global chrome, _*/


function getLiveUrl(url){

	'use strict';

	if(url.match(/^http:\/\/localhost:3738\//)){

		return url.substr(0,31);

	} else {

		return parseUrl(url).protocol + '//' + parseUrl(url).host;

	}
}

function parseUrl(string){

	'use strict';

	var parser = document.createElement('a');

	parser.href = string;

	return parser;
}

var socketRunning = false;

var liveUrls = [];

function startSocket(){

	'use strict';

	var socket = new WebSocket('ws://localhost:3738');


	socket.addEventListener('message', function(evt){

		var newUrls = JSON.parse(evt.data).urls;

		_.each(liveUrls, function(url){


			//If url is removed from refresh list
			if(!_.contains(newUrls, url)) {

				liveUrls = _.reject(liveUrls, function(ur){

					return ur === url;
				});

				stopRefreshing(url);
			}
		});

		//Start refreshing each url
		_.each(newUrls, function(url){

			if(url){
				startRefreshing(getLiveUrl(url));

				liveUrls.push(getLiveUrl(url));
			}
			

		});
	});

	socket.addEventListener('open', function(){

		socketRunning = true;
		
	});

	socket.addEventListener('close', function(){

		socketRunning = false;

	});
}

//Try to run at startup
startSocket();


//function to start refreshing tabs
function startRefreshing(url){

	'use strict';

	chrome.tabs.getAllInWindow(null, function(tabs){

		_.each(tabs, function(tab){

			if( url === getLiveUrl(tab.url) ){

				chrome.tabs.executeScript(tab.id, {file: 'scripts/live.js'});
			}
		});
	});
}


//function to stop refreshing tabs
function stopRefreshing(url){

	'use strict';

	chrome.tabs.getAllInWindow(null, function(tabs){

		_.each(tabs, function(tab){

			if( url === getLiveUrl(tab.url) ){

				chrome.tabs.reload(tab.id, { bypassCache: true });

			}
		});
	});
}


//Try to run refreshing on tab update
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

	'use strict';

	if (changeInfo.status === 'loading') return;

	if(!socketRunning){

		startSocket();

	} else {

		if(_.contains(liveUrls, getLiveUrl(tab.url))){

			startRefreshing(getLiveUrl(tab.url));
		}
	}

});