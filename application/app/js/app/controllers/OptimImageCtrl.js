/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ , $*/

//Files List controls
prepros.controller('OptimImageCtrl', function ($scope, notification, projectsManager, $route, $routeParams, $filter, config) {

    'use strict';

    var fs = require('fs-extra');
    var path = require('path');
    var jpegtran = path.join(config.basePath, '../bin/jpegtran/win32/jpegtran.exe');
    var optipng = path.join(config.basePath, '../bin/optipng/win32/optipng.exe');

    if (process.platform !== 'win32') {

        jpegtran = path.join(config.basePath, '../bin/jpegtran/osx/jpegtran');
        optipng = path.join(config.basePath, '../bin/optipng/osx/optipng');

    }

    if (process.platform === 'win32' && process.arch === 'x64') {

        jpegtran = path.join(config.basePath, '../bin/jpegtran/win64/jpegtran');
    }

    var cp = require('child_process');

    $scope.projectImages = [];

    var jpg = ['jpg', 'jpeg'];

    var png = ['png', 'gif', 'tif', 'tiff'];

    var supportedTypes = _.union(png, jpg);

    function get(dir) {

        var files = fs.readdirSync(dir);

        files.forEach(function (file) {

            var fp = dir + path.sep + file;

            if (fs.statSync(fp).isDirectory()) {

                get(fp);

            } else {

                if (_.contains(supportedTypes, path.extname(fp).slice(1))) {
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

                executable = optipng;
                cmd = [file];

            } else {

                executable = jpegtran;
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

});