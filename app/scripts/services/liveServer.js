/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros,  _ , angular*/

//Storage
prepros.factory('liveServer', function () {

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

            return 'http://localhost:3738/' + project.id + '/';
        }
    }

    // function to add project to server
    function startServing(projects) {

        urls = [];

        _.each(projects, function(project){

            if (!project.config.useCustomServer) {

                app.use('/' + project.id + '/', express.static(project.path));

                app.use('/' + project.id + '/', express.directory(project.path, {icons: true}));
            }

            if (project.config.liveRefresh) {

                urls.push(getLiveUrl(project));
            }

        });

        //Send data to browser extensions
        wsServer.broadcast(angular.toJson({urls: urls}));

    }

    //Return
    return {
        startServing: startServing,
        getLiveUrl: getLiveUrl
    };
});