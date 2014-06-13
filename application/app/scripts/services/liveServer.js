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
        var weinre = require('weinre');
        var wsServer = {}; //Global main websocket server object
        var wenWin = null; //Global weinre window
        var fs = require('fs');

        var MAIN_SERVER_PORT = Prepros.MAIN_SERVER_PORT;
        var WEINRE_SERVER_PORT = Prepros.WEINRE_SERVER_PORT;

        var enableWeinre = false; //Disable weinre and enable it only after the inspection window is opened

        var projectsBeingServed = {};


        /**
         * Prepros middleware; this injects prepros.js to the end of every html page
         */
        var _preprosMiddleware = function (dir) {

            var snippet = '<script src="/prepros.js"></script>';

            var sendHtml = function(html, req, res) {

                res.setHeader('Content-type', 'text/html');

                if(!req.xhr) {

                    if (/<\/(:?\s|)body(:?\s|)>/i.test(html)) {

                        html = html.replace(/<\/(:?\s|)body(:?\s|)>/i, (snippet + '\n</body>'));

                    } else {

                        html = html + snippet;

                    }

                }

                res.end(html);

            };

            return function (req, res, next) {


                var parsedUrl = url.parse(req.url);

                var pathName = parsedUrl.pathname;

                var realPath = path.join(dir, parsedUrl.pathname); //Security not really required here

                realPath = realPath.replace(/%40/gi, '@')
                    .replace(/%3A/gi, ':')
                    .replace(/%24/g, '$')
                    .replace(/%2C/gi, ',')
                    .replace(/%20/g, ' ');

                var extname = path.extname(realPath);

                fs.stat(realPath, function(err, stat) {

                    if(err) return next();

                    if(stat.isDirectory()) {

                        if (pathName.slice(-1) !== '/') {

                            var redirectUrl = parsedUrl.pathname + '/' + ( (parsedUrl.query) ? parsedUrl.query : '' );

                            res.redirect(redirectUrl);

                        } else {

                            fs.readFile(path.join(realPath, 'index.html'), function(err, data) {

                                if(err) return fs.readFile(path.join(realPath, 'index.htm'), function(err, data) {

                                    if(err) return next();

                                    sendHtml(data.toString(), req, res);
                                });

                                sendHtml(data.toString(), req, res);

                            })

                        }

                    } else {

                        next();

                    }
                });
            };
        };


        /**
         * Prepros Proxy; Proxies the incoming requests to actual servers
         * @param project
         * @returns {Function}
         * @private
         */

        var _preprosProxyMiddleware = function (project) {

            return function (req, res, next) {

                if (!Prepros.IS_PRO && project.config.useCustomServer) {

                    res.setHeader('Content-type', 'text/html');
                    res.end('<h4 style="margin: auto">Testing and refreshing custom server from network device and refreshing other browsers except Google Chrome is a Prepros Pro feature. If you are seeing this page on non network device please open your custom server url directly in Google Chrome. </h3>');

                } else if (Prepros.IS_PRO && project.config.useCustomServer) {

                    var headers = {};

                    _.each(req.headers, function (val, key) {

                        if (key === 'host' || key === 'accept-encoding') return;

                        headers[key] = val;

                    });


                    var parsedUrl = url.parse(project.config.customServerUrl);

                    var uri = parsedUrl.protocol + '//' + parsedUrl.host + url.parse(req.url).path;

                    var options = {
                        headers: headers,
                        host: parsedUrl.host,
                        port: parsedUrl.port,
                        uri: uri,
                        method: req.method,
                        followRedirect: false,
                        form: req.body
                    };

                    var urlRegx = new RegExp("(http|https)://" + parsedUrl.host + "(:" + parsedUrl.port + "|)", "gi");

                    var rqs = request(options, function (err, response, body) {
                        if (err) {
                            return res.end('Prepros was unable to reach ' + uri + ' . Please check your internet connection and firewall settings.');
                        }

                        return true;
                    });

                    var hasbody = false;

                    var snippet = '<script src="/prepros.js"></script>';

                    rqs.on('response', function (r) {

                        res.statusCode = r.statusCode;

                        _.each(r.headers, function (header, key) {

                            if (
                                key !== 'location' &&
                                    key !== 'cache-control' &&
                                    key !== 'content-length' &&
                                    key !== 'pragma' &&
                                    key !== 'expires'
                                ) {

                                res.setHeader(key, r.headers[key]);

                            }
                        });

                        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                        res.setHeader('Pragma', 'no-cache');
                        res.setHeader('Expires', '0');

                        if (r.headers.location) {

                            res.setHeader('location', r.headers.location.replace(urlRegx, ''));
                        }

                        rqs.on('data', function (d) {

                            if (/html/gi.test(r.headers['content-type']) && !req.xhr) {

                                var html = (d.toString('utf-8').replace(urlRegx, ''));

                                if (/<\/(:?\s|)body(:?\s|)>/i.test(html)) {
                                    html = html.replace(/<\/(:?\s|)body(:?\s|)>/i, (snippet + '\n</body>'));
                                    hasbody = true;
                                }

                                res.write(html);

                            } else {

                                res.write(d, 'binary');
                            }
                        });

                        rqs.on('end', function () {
                            if (!hasbody && /html/gi.test(r.headers['content-type']) && !req.xhr) {
                                res.write(snippet);
                            }
                            res.end();
                        });
                    });
                } else {

                    next();
                }
            };
        };

        /*
         Serves project specific prepros.js file
         */
        var _preprosJsMiddleware = function (project) {

            return function (req, res, next) {


                var src = 'script.src="/livereload.js?snipver=1&host=" + window.location.hostname + "&port=" + window.location.port + "";';
                var weinreHost = '" + window.location.hostname + "';

                var snippet = '' +
                    '(function(){' +
                    '   try {' +
                    '    var script = document.createElement("script");' +
                    '    {{src}} ' +
                    '    document.querySelectorAll("body")[0].appendChild(script);' +
                    '} catch(e) {}' +
                    '})();';


                if (enableWeinre) {

                    snippet += '' +
                        '(function(){' +
                        '   try {' +
                        '    var script = document.createElement("script");' +
                        '    script.src="http://{{weinreHost}}:' + WEINRE_SERVER_PORT + '/target/target-script-min.js#prepros";' +
                        '    document.querySelectorAll("body")[0].appendChild(script);' +
                        '} catch(e) {}' +
                        '})();';
                }


                if (!project && 'pid' in req.query) {

                    if (req.query.pid in projectsBeingServed) {

                        var port = projectsBeingServed[req.query.pid].port;

                        src = 'script.src="http://localhost:' + MAIN_SERVER_PORT + '/livereload.js?snipver=1&host=localhost&port=' + port + '";';

                        weinreHost = 'localhost';

                    } else {
						
                        return next();
                    }
                }


                res.setHeader('Content-type', 'application/x-javascript');
                res.end(snippet.replace('{{src}}', src).replace('{{weinreHost}}', weinreHost));

            };

        };

        /*
         Livereload.js middleware
         */
        var _liveReloadMiddleware = function () {

            return function (req, res, next) {

                res.sendfile(config.basePath + '/vendor/livereload/livereload.js');

            };

        };


        /*
         Main Server
         */
        (function startMainServer() {

            var app = express();

            //Run Weinre Server
            weinre.run({
                httpPort: WEINRE_SERVER_PORT,
                boundHost: '-all-',
                verbose: false,
                debug: false,
                deathTimeout: 15,
                readTimeout: 5
            });

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

                if (!(project.id in projectsBeingServed)) {

                    portfinder.getPort(function (err, port) {

                        var app = express();
                        var server = app.listen(port, function () {

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

                            app.use(_preprosMiddleware(project.path));

                            app.use(express.static(project.path));

                            app.use(express.directory(project.path, {icons: true}));
                        });
                    });
                } else {

                    projectsBeingServed[project.id].name = project.name;
                }

                if (project.config.useCustomServer) {

                    var parsed = url.parse(project.config.customServerUrl);

                    urls.push(parsed.protocol + '//' + parsed.host + '|' + project.id);
                }
            });

            if ('broadcast' in wsServer) {

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

            if (parseInt(delay, 10)) {

                setTimeout(function () {

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

            if (pid in projectsBeingServed) {

                var port = projectsBeingServed[pid].port;

                return 'http://localhost:' + port;

            } else {

                return 'http://localhost:' + MAIN_SERVER_PORT;
            }
        }

        /*
         Open Remote Inspector
         */
        function openRemoteInspect() {

            enableWeinre = true;

            //Refresh all projects to  load weinre script
            _.each(projectsBeingServed, function (project, pid) {

                refresh(pid, 'index.html', 0);

            });

            var winreUrl = 'http://localhost:' + WEINRE_SERVER_PORT + '/client/#prepros';

            if (!wenWin) {

                wenWin = Prepros.gui.Window.open(winreUrl, {
                    title: 'Prepros Remote Inspect',
                    width: 850,
                    height: 550,
                    frame: true,
                    toolbar: false,
                    resizable: true,
                    show: true,
                    min_width: 400,
                    min_height: 400,
                    show_in_taskbar: true,
                    icon: 'app/assets/img/icons/128.png' //Relative to package.json file
                });

                wenWin.once('closed', function () {

                    enableWeinre = false;

                    //Refresh all projects to remove weinre script
                    _.each(projectsBeingServed, function (project, pid) {

                        refresh(pid, 'index.html', 0);

                    });

                    wenWin.removeAllListeners();
                    wenWin = null;
                });

            } else {
                wenWin.show();
                wenWin.focus();
            }

        }

        //Return
        return {
            startServing: startServing,
            getLiveUrl: getLiveUrl,
            refresh: refresh,
            openRemoteInspect: openRemoteInspect
        };
    }
]);