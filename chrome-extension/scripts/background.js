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

function parseUrl(string) {

  'use strict';

  var parser = document.createElement('a');

  parser.href = string;

  return parser;
}

var socketRunning = false,
  liveUrls = [],
  livePids = [];

function startSocket(callback) {

  'use strict';

  var socket = new WebSocket('ws://localhost:5656');

  socket.addEventListener('message', function(evt) {

    liveUrls = [];
    livePids = {};

    JSON.parse(evt.data).urls.forEach(function(url) {

      liveUrls.push(url.split('|')[0]);
      livePids[url.split('|')[0]] = url.split('|')[1];

      chrome.tabs.getAllInWindow(null, function(tabs) {

        tabs.forEach(function(tab) {

          if (liveUrls.contains(parseUrl(tab.url).protocol + '//' + parseUrl(tab.url).host)) {

            chrome.tabs.reload(tab.id, {
              bypassCache: true
            });

          }
        });
      });

    });
  });

  socket.addEventListener('open', function() {

    socketRunning = true;

    callback();

  });

  socket.addEventListener('close', function() {

    socketRunning = false;

  });
}

//Try to run refreshing on tab update
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

  'use strict';

  if (tab.status === 'complete') {

    var callback = function() {

      var parsedUrl = parseUrl(tab.url).protocol + '//' + parseUrl(tab.url).host;

      if (liveUrls.contains(parsedUrl)) {

        var snippet = ' (function () { var script = document.createElement("script"); document.querySelector("body").appendChild(script); script.src = "http://localhost:5656/prepros.js?pid=' + livePids[parsedUrl] + '";})();';

        chrome.tabs.executeScript(tab.id, {
          code: snippet
        });
      }

    };

    if (!socketRunning) {

      startSocket(callback);

    } else {

      callback();
    }

  }

});
