/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */


/*jshint browser: true, node: true*/
/*global $, CustomEvent*/

(function () {

    'use strict';

    //Redirect to saved application state url at first
    if (localStorage.stateUrl) {

        window.location.hash = localStorage.stateUrl;

    }

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

    }).listen(port, '127.0.0.1', function () {

            var nw = {
                gui: require('nw.gui'),
                window: require('nw.gui').Window.get()
            };

            //Wait 100ms for app to load and show window to prevent flash of unloaded content; works on most computers
            window.setTimeout(function(){
                nw.window.show();
            }, 100);


            //Prevent unhandled file drops
            $(window).on('dragenter dragexit dragover drop', function (e) {
                e.preventDefault();
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
                //Save application state url
                localStorage.stateUrl = window.location.hash;
                this.close(true);
            });

            //Push tray icon to global window to tell garbage collector that tray icon is not garbage
            window.tray_icon = tray_icon;

        });


    //Error means another instance is running
    //So request the server to show previous instance
    server.on('error', function () {
        http.get('http://127.0.0.1:' + port, function () {
            require('nw.gui').Window.get().close(true);
        });
    });

})();