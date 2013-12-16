/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros,  _ , angular, Prepros*/

//Storage
prepros.factory('liveServer', [

    'config',

    function (config) {

        'use strict';

        var express = require('express');
        var fs = require('fs');
        var WebSocketServer = require('websocket').server;
        var urls = [];
        var portfinder = require('portfinder');
        var url = require('url');
        var request = require('request');
        var path = require('path');
        var coffeescript = require('coffee-script');
        var wsServer = {}; //Global main websocket server object

        var MAIN_SERVER_PORT = Prepros.MAIN_SERVER_PORT;

        var projectsBeingServed = {};


        /**
         * Prepros middleware; this injects prepros.js to the end of every html page
         */
        var _preprosMiddleware = function() {

            return function (req, res, next) {

                var writeHead = res.writeHead;
                var end = res.end;


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

                        var snippet = '<script src="/prepros.js"></script>';

                        if(/<\/(:?\s|)body(:?\s|)>/i.test(body)) {
                            body =  body.replace(/<\/(:?\s|)body(:?\s|)>/i, (snippet + '\n</body>'));
                        } else {
                            body = body + snippet;
                        }

                        res.push(body);
                    }
                };

                res.end = function (string, encoding) {

                    res.writeHead = writeHead;
                    res.end = end;

                    var result = res.inject(string, encoding);

                    if (res.data !== undefined && !res._header) {
                        res.setHeader('content-length', Buffer.byteLength(res.data, encoding));
                    }

                    res.end(res.data, encoding);
                };

                return next();

            };
        };


        /**
         * Prepros Proxy; Proxies the incoming requests to actual servers
         * @param project
         * @returns {Function}
         * @private
         */

        var _preprosProxyMiddleware = function(project) {

            return function(req, res, next) {

                if(!Prepros.IS_PRO && project.config.useCustomServer) {

                    res.setHeader('Content-type', 'text/html');
                    res.end('<h4 style="margin: auto">Testing and refreshing custom server from network device and refreshing other browsers except Google Chrome is a Prepros Pro feature. If you are seeing this page on non network device please open your custom server url directly in Google Chrome. </h3>');

                } else  {

                    next();
                }
            };
        };

        /*
        Serves project specific prepros.js file
         */
        var _preprosJsMiddleware = function(project) {

            return function(req, res, next) {


                var src = 'script.src="/livereload.js?snipver=1&host=" + window.location.hostname + "&port=" + window.location.port + "";';

                var snippet = '' +
                    '(function(){' +
                    '   try {' +
                    '    var script = document.createElement("script");' +
                    '    {{src}} ' +
                    '    document.querySelectorAll("body")[0].appendChild(script);' +
                    '} catch(e) {}' +
                    '})();';

                if(!project && 'pid' in req.query) {

                    if(req.query.pid in projectsBeingServed) {


                        var port = projectsBeingServed[req.query.pid].port;

                        src = 'script.src="http://localhost:' + MAIN_SERVER_PORT + '/livereload.js?snipver=1&host=localhost&port=' + port + '";';

                    } else {
                        return next();
                    }
                }


                res.setHeader('Content-type', 'application/x-javascript');
                res.end(snippet.replace('{{src}}', src));

            };

        };

        /*
        Livereload.js middleware
         */
        var _liveReloadMiddleware = function() {

            return function(req, res, next) {

                res.sendfile(config.basePath + '/vendor/livereload/livereload.js');

            };

        };


        /*
        Main Server
         */
        (function startMainServer() {

            var app = express();

            //Start listening
            var httpServer = app.listen(MAIN_SERVER_PORT);

            httpServer.on('error', function (err) {
                window.alert('Unable to start internal server, Please close the app that is using port ' + MAIN_SERVER_PORT + '. error: ' + err.message);
                Prepros.gui.App.quit();
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

            app.get('/livereload.js', _liveReloadMiddleware());

            app.get('/prepros.js', _preprosJsMiddleware());

            //Index page for projects
            app.set('views', config.basePath + '/partials/live-server');

            app.set('view engine', 'jade');

            app.get('/favicon.ico', function (req, res) {

                res.sendfile(config.basePath + '/assets/img/icons/ico.ico');

            });

            app.get('/', function (req, res) {

                res.render('index', {
                    projects: projectsBeingServed
                });

            });
        })();




        /*
        Start serving projects
         */
        function startServing(projects) {

            urls = [];

            _.each(projects, function (project) {

                if(!(project.id in projectsBeingServed)) {

                    portfinder.getPort(function (err, port) {

                        var app = express();
                        var server = app.listen(port, function() {

                            var port = server.address().port;

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
                                lServer: lServer,
                                project: project
                            };

                            projectsBeingServed[project.id].url = getLiveUrl(project);

                            app.get('/livereload.js', _liveReloadMiddleware());

                            app.get('/prepros.js', _preprosJsMiddleware(project));

                            app.use(express.bodyParser());

                            app.use(_preprosProxyMiddleware(project));

                            app.use(_preprosMiddleware());

                            app.use(express.static(project.path));

                            app.use(express.directory(project.path, {icons: true}));
                        });
                    });
                } else {

                    projectsBeingServed[project.id].name = project.name;
                }

                if(project.config.useCustomServer) {

                    var parsed = url.parse(project.config.customServerUrl);

                    urls.push(parsed.protocol + '//' + parsed.host + '|' + project.id);
                }
            });

            if('broadcast' in wsServer) {

                //Send data to browser extensions
                wsServer.broadcast(angular.toJson({urls: urls}));
            }
        }


        /*
        Function to refresh
         */
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


        /*
        Get live preview url
         */
        function getLiveUrl(pid) {

            if(pid in projectsBeingServed) {

                var port = projectsBeingServed[pid].port;

                return 'http://localhost:' + port;

            } else {

                return 'http://localhost:' + MAIN_SERVER_PORT;
            }
        }

        //Return
        return {
            startServing: startServing,
            getLiveUrl: getLiveUrl,
            refresh: refresh
        };
    }
]);