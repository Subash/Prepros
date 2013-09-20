/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ , $*/

//Files List controls
prepros.controller('OptimImageCtrl', [

    '$scope',
    'notification',
    'projectsManager',
    '$route',
    '$routeParams',
    '$filter',
    'config',

    function ($scope, notification, projectsManager, $route, $routeParams, $filter, config) {

        'use strict';

        var fs = require('fs-extra');
        var path = require('path');
        var cp = require('child_process');

        var platform = 'win';

        if(process.platform === 'darwin') {
            platform = 'osx';
        }

        if(process.platform === 'linux') {
            platform = 'linux';
        }

        var arch = (process.arch === 'x64') ? 'x64' : 'x86';

        var binPath =   path.join(config.basePath, '../bin');

        var jpegTranPath = path.join(binPath, 'jpegtran', platform, arch, 'jpegtran');

        var optipngPath = path.join(binPath, 'optipng', platform, 'optipng');

        if(platform === 'win') {
            jpegTranPath += '.exe';
            optipngPath += '.exe';
        }

        if(platform === 'osx') {
            jpegTranPath = path.join(binPath, 'jpegtran', platform, 'jpegtran');
        }

        if(platform === 'linux') {
            optipngPath = path.join(binPath, 'optipng', platform, arch, 'optipng');
        }

        $scope.projectImages = [];

        var jpg = ['jpg', 'jpeg'];

        var png = ['png', 'tif', 'tiff'];

        var supportedTypes = _.union(png, jpg);

        function get(dir) {

            var files = fs.readdirSync(dir);

            files.forEach(function (file) {

                var fp = dir + path.sep + file;

                if (fs.statSync(fp).isDirectory()) {

                    get(fp);

                } else {

                    if (_.contains(supportedTypes, path.extname(fp).slice(1).toLowerCase()) && !projectsManager.matchFilters($scope.selectedProject.id, fp)) {
                        $scope.projectImages.push({
                            path: fp,
                            type: path.extname(fp).slice(1),
                            shortPath: $filter('interpolatePath')(fp, {config: $scope.selectedProject.config, relative: true, basePath: $scope.selectedProject.path})
                        });
                    }
                }
            });
        }

        //Prevent subsequent optimizations
        var compileList = [];

        $scope.optimize = function (e, file) {

            if (!_.contains(compileList, file)) {

                compileList.push(file);

                var $target = $(e.currentTarget);

                $target.addClass('optimizing');
                $target.attr('disabled', 'true');
                $target.children('span').text('');

                var cmd = [];
                var executable;
                var ext = path.extname(file).slice(1);

                if (_.contains(png, ext)) {

                    executable = optipngPath;
                    cmd = [file];

                } else {

                    executable = jpegTranPath;
                    cmd = ['-outfile', file, '-optimize', file];

                }

                //Spawn child process to optimize image
                var optimizeProcess = cp.spawn(executable, cmd);

                var commonCall = function() {

                    compileList = _.without(compileList, file);

                    $target.delay(300)
                        .queue(function () {
                            $target.removeClass('optimizing');
                            $target.removeAttr('disabled');
                            $target.dequeue();
                        });
                };

                var errorCall = function(){

                    commonCall();

                    $target.delay(0)
                        .queue(function () {
                            $target.addClass('failed');
                            $target.children('span').text('Failed');
                            $target.dequeue();
                        });
                };

                var successCall= function() {

                    commonCall();

                    $target.delay(0)
                        .queue(function () {
                            $target.addClass('done');
                            $target.children('span').text('Done');
                            $target.dequeue();
                        });
                };

                optimizeProcess.on('error', function (e) {
                    errorCall();
                });

                optimizeProcess.on('exit', function (data) {

                    if (data.toString() !== '0') {
                        errorCall();
                    } else {
                        successCall();
                    }

                    optimizeProcess.removeAllListeners();
                    optimizeProcess = null;
                });
            }
        };

        $scope.$on('$routeChangeSuccess', function () {

            var projectExists = !_.isEmpty(_.findWhere($scope.projects, {id: $routeParams.pid}));

            if ($route.current.path === 'optim' && projectExists) {

                try {

                    $scope.projectImages = [];

                    get(_.findWhere($scope.projects, {id: $routeParams.pid}).path);

                } catch (e) {

                    notification.error('Error ! ', 'An error occurred while scanning project files', e.message);

                }
            } else {

                $scope.projectImages = [];

            }

        });

    }
]);