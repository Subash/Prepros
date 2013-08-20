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
        url = require('url'),
        request = require('request');

    var MAIN_SERVER_PORT = 5656;

    var projectsBeingServed = {};

    //Start listening
    var httpServer = app.listen(MAIN_SERVER_PORT);
    httpServer.on('error', function (err) {
        window.alert('Unable to start internal server, Please close the app that is using port ' + MAIN_SERVER_PORT + '. error: ' + err.message);
        require('nw.gui').App.quit();
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
                    '(function(){var script = document.createElement("script");' +
                    'script.src="/livereload.js?snipver=1&host=" + window.location.hostname + "&port=" + window.location.port;' +
                    'document.body.appendChild(script);' +
                    '})();' +
                    '</script>';

                if(/<\/(:?\s|)body(:?\s|)>/i.test(body)) {
                    body =  body.replace(/<\/(:?\s|)body(:?\s|)>/i, snippet);
                    body += '</body>';
                } else {
                    body += snippet;
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
                        lServer.broadcast("!!ver:1.6");
                    });

                    projectsBeingServed[project.id] = {
                        name: project.name,
                        port: port,
                        app: app,
                        server: server,
                        lServer: lServer
                    };

                    projectsBeingServed[project.id].url = getLiveUrl(project);

                    app.get('/livereload.js', function(req, res) {
                        res.sendfile(config.basePath + '/vendor/livereload.js');
                    });

                    app.use(function(req, res, next) {

                        if(project.config.useCustomServer) {

                            var options = {
                                host: url.parse(project.config.customServerUrl).host,
                                port: url.parse(project.config.customServerUrl).port,
                                uri: url.parse(project.config.customServerUrl).protocol + '//' + url.parse(project.config.customServerUrl).host + url.parse(req.url).path,
                                method : req.method,
                                cookie: req.cookie,
                                followRedirect: false
                            };

                            var urlRegx = new RegExp("(http|https)://" + url.parse(project.config.customServerUrl).host + "(:" + url.parse(project.config.customServerUrl).port + "|)", "gi");

                            var rqs = request(options, function (err, response, body) {
                                if(err) {
                                    res.end('Custom Server Unreachable Check Settings.');
                                }
                            });

                            var hasbody = false;
                            var snippet = '<script>' +
                                '(function(){var script = document.createElement("script");' +
                                'script.src="/livereload.js?snipver=1&host=" + window.location.hostname + "&port=" + window.location.port;' +
                                'document.body.appendChild(script);' +
                                '})();' +
                                '</script>';

                            rqs.on('response', function(r) {

                                res.setHeader('Content-Type', r.headers['content-type']);
                                res.statusCode = r.statusCode;
                                if(r.headers.location) {
                                    return res.redirect(r.headers.location.replace(urlRegx, ''));
                                }

                                rqs.on('data', function(d) {

                                    if(/html/gi.test(r.headers['content-type'])) {

                                        var html = (d.toString().replace(urlRegx, ''));

                                        if(/<\/(:?\s|)body(:?\s|)>/i.test(html)) {
                                            html =  html.replace(/<\/(:?\s|)body(:?\s|)>/i, snippet);
                                            html += '</body>';
                                            hasbody = true;
                                        }

                                        res.write(html);

                                    } else {
                                        res.write(d, "binary");
                                    }
                                });

                                rqs.on('end', function() {
                                    if(!hasbody && /html/gi.test(r.headers['content-type'])) {
                                        res.write(snippet);
                                    }
                                    res.end();
                                });
                            });
                        } else {
                            next();
                        }
                    });

                    app.use(liveReloadMiddleWare);
                    app.use(express.static(project.path));
                    app.use(express.directory(project.path, {icons: true}));

                });
            }
        });
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