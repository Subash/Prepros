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
        fs = require('fs'),
        app = express(),
        WebSocketServer = require('websocket').server,
        urls = [],
        portfinder = require('portfinder'),
        url = require('url');

    var MAIN_SERVER_PORT = 5656;

    var projectsBeingServed = {};

    //Start listening
    var httpServer = app.listen(MAIN_SERVER_PORT);
    httpServer.on('error', function (err) {
        window.alert('Unable to start internal server, Please close the app that is using port ' + MAIN_SERVER_PORT + '. error: ' + err.message);
        require('nw.gui').App.quit();
    });

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

    //Serve livereload.js from /lr/ path which points to vendor dir
    app.use('/livereload.js', function(req, res, next) {

        fs.readFile(config.basePath + '/js/vendor/livereload.js', function(err, data) {
            res.setHeader('Content-Type', 'text/javascript');
            res.send(data.toString());
        });
    });

    app.use('/prepros.js', function(req, res, next) {

        if('pid' in req.query) {

            if(req.query.pid in projectsBeingServed) {
                res.setHeader('Content-Type', 'text/javascript');
                var snippet = '(function () { var script = document.createElement("script"); document.querySelector("body").appendChild(script); script.src = "http://localhost:5656/livereload.js?snipver=1&host=localhost&port=' + projectsBeingServed[req.query.pid].port + '";})()';
                res.send(snippet);
            }
        }
    });

    //Generates live preview url
    function getLiveUrl(project) {
        var port = projectsBeingServed[project.id].port;
        return 'http://localhost:' + port;
    }

    var liveReloadMiddleWare = function (req, res, next) {

        var writeHead = res.writeHead;
        var write = res.write;
        var end = res.end;
        var path = require('path');
        var url = require('url');

        var filepath = url.parse(req.url).pathname;

        filepath = filepath.slice(-1) === '/' ? filepath + 'index.html' : filepath;

        var html = ['.html', '.htm'];

        if (!_.contains(html, path.extname(filepath))) {

            return next();
        }

        res.push = function (chunk) {
            res.data = (res.data || '') + chunk;
        };

        res.inject = res.write = function (string, encoding) {

            if (string !== undefined) {

                var body = string instanceof Buffer ? string.toString(encoding) : string;

                var snippet = '<script>' +
                    '(function(){var script = document.createElement("script");document.querySelector("body").appendChild(script);' +
                    'script.src="http://" + window.location.hostname + ":' + MAIN_SERVER_PORT + '/livereload.js?snipver=1&host=" + window.location.hostname + "&port=" + window.location.port })();' +
                    '</script>';

                if(/<\/body>/i.test(body)) {
                    body =  body.replace(/<\/body>/i, snippet);
                } else {
                    body = body + snippet;
                }

                res.push(body);
            }
            return true;
        };

        res.end = function (string, encoding) {
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

    //function to add project to server
    function startServing(projects) {

        urls = [];

        _.each(projects, function (project) {

            if(!(project.id in projectsBeingServed)) {

                portfinder.getPort(function (err, port) {

                    var app = express();
                    var server = app.listen(port);
                    var lServer = new WebSocketServer({
                        httpServer: server,
                        autoAcceptConnections: false
                    });

                    lServer.on('request', function (request) {
                        request.accept('', request.origin);
                        lServer.broadcast(("!!ver:1.6"));
                    });

                    projectsBeingServed[project.id] = {
                        name: project.name,
                        port: port, app: app,
                        server: server,
                        lServer: lServer
                    };

                    projectsBeingServed[project.id].url = getLiveUrl(project);

                    app.use(liveReloadMiddleWare);
                    app.use('/', express.static(project.path));
                    app.use('/', express.directory(project.path, {icons: true}));

                });
            }

            if(project.config.useCustomServer) {

                var parsed = url.parse(project.config.customServerUrl);

                urls.push(parsed.protocol + '//' + parsed.host + '|' + project.id);

            }

        });

        //Send data to browser extensions
        wsServer.broadcast(angular.toJson({urls: urls}));
    }

    //Index page for projects
    app.set('views', config.basePath + '/templates/live-server');

    app.set('view engine', 'jade');

    app.get('/', function (req, res) {

        res.render('index', {
            projects: projectsBeingServed
        });

    });

    function refresh(pid, file, delay) {

        var data = JSON.stringify([
            'refresh', {
                path: file,
                apply_js_live: false,
                apply_css_live: true
            }
        ]);

        if(parseInt(delay, 10)) {

            setTimeout(function() {

                projectsBeingServed[pid].lServer.broadcast(data);

            }, parseInt(delay, 10));

        } else {

            projectsBeingServed[pid].lServer.broadcast(data);
        }
    }

    //Return
    return {
        startServing: startServing,
        getLiveUrl: getLiveUrl,
        refresh: refresh
    };
});