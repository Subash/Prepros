/*jshint browser: true, node: true*/
/*global $, CustomEvent*/

//Redirect to saved application state url at first
if(localStorage.stateUrl){

    window.location.hash = localStorage.stateUrl;

}

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

//Load frame
$(document).on('loadFrame', function () {

    'use strict';

    var nw = {
        gui : require('nw.gui'),
        window: require('nw.gui').Window.get()
    };

    //Show window
    nw.window.show();

    //Prevent unhandled file drops
    $(window).on('dragenter dragexit dragover drop', function(e){
        e.preventDefault();
    });

    //Title bar controls
    $('.title-bar .controls .close-app').on('click', function () {
        nw.window.close();
    });

    $('.title-bar .controls .love').on('click', function () {
        require('child_process').spawn('explorer', ['http://alphapixels.com/prepros#love'], {detached: true});
    });

    $('.title-bar .controls .minimize-app').on('click', function () {
        nw.window.minimize();
    });

    $('.title-bar .controls .to-tray').on('click', function () {

        nw.window.hide();
    });

    //Tray icon
    var tray_icon = new nw.gui.Tray({
        title: 'Prepros App',
        icon: 'app/assets/img/icons/16.png' //Relative to package.json file
    });

    //Tray Icon Right Click Menu
    var tray_menu = new nw.gui.Menu();

    tray_menu.append(new nw.gui.MenuItem({
        label: 'Show Window',
        click: function () {
            nw.window.show();
            nw.window.focus();
        }
    }));

    tray_menu.append(new nw.gui.MenuItem({
        label: 'Hide Window',
        click: function () {
            nw.window.hide();
        }
    }));

    tray_menu.append(new nw.gui.MenuItem({
        label: 'Exit App',
        click: function () {
            nw.window.close();
        }
    }));

    tray_icon.menu = tray_menu;
    tray_icon.on('click', function () {
        nw.window.show();
        nw.window.focus();
    });


    nw.window.on('close', function () {
        tray_icon.remove();
        tray_icon = null;
        this.close(true);
    });
});
