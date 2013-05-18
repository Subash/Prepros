/*jshint browser: true, node: true*/
/*global prepros,  _ , angular*/

//Storage
prepros.factory('liveRefresh', function () {

    'use strict';

    var express = require('express'),
        fs = require('fs-extra'),
        path = require('path'),
        app = express(),
        WebSocketServer = require('websocket').server,
        urls= [],
        httpServerPort;

    //User data path
    var dataPath = path.join(process.env.LOCALAPPDATA, 'Prepros/Data');

    //User config file
    var configFile = path.join(dataPath, 'config.json');

    //Read user config and get Server Port.
    if (fs.existsSync(configFile)) {
        try {
            httpServerPort = parseInt(JSON.parse(fs.readFileSync(configFile).toString()).httpServerPort);
        } catch(e){
            httpServerPort = 3738; //Fallback to Default port in case port set is not a valid number (config.json was changed outside Prepros!).
        }
    }

    //Start listening
    var httpServer = app.listen(httpServerPort);


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

            return 'http://localhost:'+ httpServerPort +'/' + project.id + '/';
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