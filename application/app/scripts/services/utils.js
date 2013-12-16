/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, $, _, Backbone */
prepros.factory('utils', [

    'config',

    function (config) {

        'use strict';

        var md5 = require('MD5'),
            path = require('path'),
            fs = require('fs-extra');

        function id(string) {

            return md5(string.toLowerCase().replace(/\\/gi, '/')).substr(8, 8);
        }

        //Instantiate Backbone Notifier
        var notifier = new Backbone.Notifier({
            theme: 'clean',
            types: ['warning', 'error', 'info', 'success'],
            modal: true,
            ms: false,
            offsetY: 100,
            position: 'top',
            zIndex: 10000,
            screenOpacity: 0.5
        });

        //Shows loading overlay
        function showLoading() {

            notifier.info({
                message: "Loading..... :) ",
                destroy: true,
                loader: true
            });
        }

        //Hide loading animation
        function hideLoading() {
            notifier.destroyAll();
        }


        function isFileInsideFolder(folder, file) {

            return path.normalize(file.toLowerCase()).indexOf(path.normalize(folder.toLowerCase())) === 0;
        }

        function readDirs(dir, done) {

            var results = [];

            fs.readdir(dir, function (err, list) {

                if (err) {
                    return done(err);
                }

                var i = 0;

                (function next() {

                    var file = list[i++];

                    if (!file) {

                        return done(null, results);
                    }

                    file = dir + path.sep + file;

                    fs.stat(file, function (err, stat) {

                        if (stat && stat.isDirectory()) {

                            readDirs(file, function (err, res) {

                                results = results.concat(res);
                                next();
                            });
                        } else {

                            results.push(file);
                            next();
                        }
                    });
                })();
            });
        }

        function isCrapFile(f) {

            var crapReg = /(?:thumbs\.db|desktop\.ini)/gi;

            return crapReg.test(f);

        }


        //Convert a project
        function convertProject(project) {


            var pr = {
                id: project.id,
                cfgVersion: 1,
                name: project.name,
                path: project.path,
                files: {},
                imports: {},
                images: {},
                config: {
                    watch: true,
                    liveRefresh: project.config.liveRefresh,
                    liveRefreshDelay: project.config.liveRefreshDelay,
                    filterPatterns: project.config.filterPatterns,
                    useCustomServer: project.config.useCustomServer,
                    customServerUrl: project.config.customServerUrl,
                    cssPath: config.getUserOptions().cssPath,
                    jsPath: config.getUserOptions().jsPath,
                    htmlPath: config.getUserOptions().htmlPath,
                    minJsPath: config.getUserOptions().minJsPath,
                    htmlExtension: config.getUserOptions().htmlExtension,
                    cssPathType: config.getUserOptions().cssPathType,
                    htmlPathType: config.getUserOptions().htmlPathType,
                    jsPathType: config.getUserOptions().jsPathType,
                    minJsPathType: config.getUserOptions().minJsPathType,
                    htmlTypes: config.getUserOptions().htmlTypes,
                    cssTypes: config.getUserOptions().cssTypes,
                    jsTypes: config.getUserOptions().jsTypes,
                    cssPreprocessorPath: config.getUserOptions().cssPreprocessorPath,
                    htmlPreprocessorPath: config.getUserOptions().htmlPreprocessorPath,
                    jsPreprocessorPath: config.getUserOptions().jsPreprocessorPath,
                    minJsPreprocessorPath: config.getUserOptions().minJsPreprocessorPath,
                    autoprefixerBrowsers: project.config.autoprefixerBrowsers,
                    ftpHost: project.config.ftpHost,
                    ftpPort: project.config.ftpPort,
                    ftpRemotePath: project.config.ftpRemotePath,
                    ftpUsername: project.config.ftpUsername,
                    ftpPassword: project.config.ftpPassword,
                    ftpIgnorePreprocessorFiles: project.config.ftpIgnorePreprocessorFiles,
                    ftpType: 'FTP', //FTP, SFTP
                    ftpExcludePatterns: project.config.ftpExcludePatterns
                }
            };


            if (project.config.cssPath.indexOf(':') < 0) {

                pr.config.cssPathType = 'REPLACE_TYPE';
                pr.config.cssPath = project.config.cssPath;

            }

            if (project.config.jsPath.indexOf(':') < 0) {

                pr.config.jsPathType = 'REPLACE_TYPE';
                pr.config.jsPath = project.config.jsPath;

            }

            if (project.config.htmlPath.indexOf(':') < 0) {

                pr.config.htmlPathType = 'REPLACE_TYPE';
                pr.config.htmlPath = project.config.htmlPath;

            }

            if (project.config.jsMinPath && project.config.jsMinPath.indexOf(':') < 0) {

                pr.config.minJsPathType = 'RELATIVE_FILEDIR';
                pr.config.minJsPath = project.config.jsMinPath;

            }

            _.each(project.files, function (file) {

                var _file = {};

                _file.config = {};
                _file.id = file.id;
                _file.pid = file.pid;
                _file.name = file.name;
                _file.type = file.type;

                _file.input = file.input;

                file.customOutput = false;

                if (file.output && file.output.indexOf(':') >= 0) {

                    _file.customOutput = file.output;
                }

                if (file.customOutput) {

                    _file.customOutput = file.customOutput;

                }

                _file.config = $.extend(_file.config, file.config);

                pr.files[file.id] = _file;
            });


            _.each(project.imports, function (imp) {

                pr.imports[imp.id] = imp;

            });

            if (!_.isEmpty(project.images)) {

                _.each(project.images, function (image) {

                    pr.images[image.id] = image;

                })

            }

            return JSON.parse(JSON.stringify(pr));
        }


        //Convert old projects to new projects
        function convertProjects(projects) {

            var _pr = {};

            _.each(projects, function (project) {

                _pr[project.id] = convertProject(project);

            });


            return JSON.parse(JSON.stringify(_pr));

        }

        return {
            id: id,
            showLoading: showLoading,
            hideLoading: hideLoading,
            notifier: notifier,
            isFileInsideFolder: isFileInsideFolder,
            readDirs: readDirs,
            isCrapFile: isCrapFile,
            convertProject: convertProject,
            convertProjects: convertProjects
        };
    }
]);