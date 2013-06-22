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
    var httpServer = app.listen(5656);

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

            return 'http://localhost:5656/' + project.config.serverUrl + '/';
        }
    }


    //Live reload middleware inspired by https://github.com/intesso/connect-livereload
    function liveReload(opt) {

        var snippet = '<script src="http://localhost:5656/lr/livereload.js?snipver=1&host=localhost&port=25690"></script>';

        return function liveReload(req, res, next) {
            var writeHead = res.writeHead;
            var write = res.write;
            var end = res.end;
            var path = require('path');
            var url = require('url');

            var filepath = url.parse(req.url).pathname;

            filepath = filepath.slice(-1) === '/' ? filepath + 'index.html' : filepath;

            if (path.extname( filepath ) !== '.html') {

                return next();
            }

            res.push = function(chunk) {
                res.data = (res.data || '') + chunk;
            };

            res.inject = res.write = function(string, encoding) {

                if (string !== undefined) {

                    var body = string instanceof Buffer ? string.toString(encoding) : string;

                    res.push(body.replace(/<\/body>/, function (w) {
                        return snippet + w;
                    }));
                }

                return true;
            };

            res.end = function(string, encoding) {
                res.writeHead = writeHead;
                res.end = end;
                var result = res.inject(string, encoding);
                if (!result) {
                    return res.end(string, encoding);
                }

                if (res.data !== undefined && !res._header) {
                    res.setHeader('content-length', Buffer.byteLength(res.data, encoding));
                }

                res.end(res.data, encoding);
            };

            next();
        };
    }

    app.use(liveReload());

    //function to add project to server
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

        //Live reload connection port
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