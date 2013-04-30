/*jshint browser: true, node: true*/
/*global CustomEvent */

//Single instance
(function(){

    'use strict';

    var http = require('http');

    // Random enough  :)
    var port = 57368;

    //Try to create server
    var server = http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Prepros App');

        //Show and maximize window on request
        var nwWindow = require('nw.gui').Window.get();
        nwWindow.show();
        nwWindow.focus();
        nwWindow.requestAttention(true);

    }).listen(port, '127.0.0.1', function(){

            //Load frame
            document.dispatchEvent(new CustomEvent('loadFrame'));

        });



    //Error means another instance is running
    //So request the server to show previous instance
    server.on('error', function(){
        http.get('http://127.0.0.1:' + port, function() {
            require('nw.gui').Window.get().close(true);
        });
    });

})();