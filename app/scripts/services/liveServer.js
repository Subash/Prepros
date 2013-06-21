/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, es5: true*/
/*global prepros,  _ , angular*/

//Storage
prepros.factory('liveServer', function (config) {

    'use strict';

    var express = require('express'),
        app = express(),
        WebSocketServer = require('websocket').server,
        urls= [];

    //Start listening
    var httpServer = app.listen(3738);

    //Start websocket server for automatic browser refresh
    var wsServer = new WebSocketServer({

        httpServer: httpServer,

        autoAcceptConnections: false

    });

    //Send the list of urls to refresh to extension on connect
    wsServer.on('request', function (request) {

        request.accept('', request.origin);

        wsServer.broadcast(angular.toJson({urls: urls}));

    });

    //Stop refreshing on app close
    require('nw.gui').Window.get().on('close', function () {

        wsServer.broadcast(angular.toJson({ urls: []}));

    });


    //Generates live preview url
    function getLiveUrl(project) {

        if (project.config.useCustomServer) {

            var url = require('url');
            var parsed = url.parse(project.config.customServerUrl);
            return parsed.protocol + '//'  + parsed.host;

        } else {

            return 'http://localhost:3738/' + project.config.serverUrl + '/';
        }
    }

    // function to add project to server
    function startServing(projects) {

        urls = [];

        _.each(projects, function(project){

            if (!project.config.useCustomServer) {

                app.use('/' + project.config.serverUrl + '/', express.static(project.path));

                app.use('/' + project.config.serverUrl + '/', express.directory(project.path, {icons: true}));
            }

            if (project.config.useCustomServer) {

                urls.push(getLiveUrl(project));
            }
        });

        //Send data to browser extensions
        wsServer.broadcast(angular.toJson({urls: urls}));

    }

    var refreshServer =  new WebSocketServer({

        httpServer: app.listen(25690),

        autoAcceptConnections: false

    });

    app.use('/lr/', express.static(config.basePath + '/scripts/libraries/'));
    app.use('/lr/', express.directory(config.basePath + '/scripts/libraries/'));

    refreshServer.on('request', function (request) {

        request.accept('', request.origin);

        refreshServer.broadcast(("!!ver:1.6"));

    });

    function refresh(file) {

        var data = JSON.stringify([
            'refresh', {
                path: file,
                apply_js_live: false,
                apply_css_live: true
            }
        ]);

        refreshServer.broadcast(data);
    }

    //Return
    return {
        startServing: startServing,
        getLiveUrl: getLiveUrl,
        refresh: refresh
    };
});