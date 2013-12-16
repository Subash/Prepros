/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, loopfunc: true, curly: false*/
/*global prepros, _*/

//Imports Visitor
prepros.factory('imageOptimization', [

    'config',
    '$rootScope',

    function (config, $rootScope) {

        'use strict';

        var fs = require('fs-extra');
        var path = require('path');
        var cp = require('child_process');

        var platform = 'win';

        if (process.platform === 'darwin') platform = 'osx';

        if (process.platform === 'linux') platform = 'linux';

        var arch = (process.arch === 'x64') ? 'x64' : 'x86';

        var binPath = path.join(config.basePath, '../bin');

        var jpegTranPath = path.join(binPath, 'jpegtran', platform, arch, 'jpegtran');

        var optipngPath = path.join(binPath, 'optipng', platform, 'optipng');

        if (platform === 'win') {
            jpegTranPath += '.exe';
            optipngPath += '.exe';
        }

        if (platform === 'osx') jpegTranPath = path.join(binPath, 'jpegtran', platform, 'jpegtran');

        if (platform === 'linux') optipngPath = path.join(binPath, 'optipng', platform, arch, 'optipng');

        var jpg = ['jpg', 'jpeg'];

        var png = ['png', 'tif', 'tiff'];


        //Function to optimize Images
        var _optimize = function (image, callback) {

            var ext = path.extname(image).slice(1);

            var executable = (_.contains(png, ext)) ? optipngPath : jpegTranPath;

            var cmd = (_.contains(png, ext)) ? [image] : ['-outfile', image, '-optimize', image];

            //Spawn child process to optimize image
            var optimizeProcess = cp.spawn(executable, cmd);

            optimizeProcess.once('error', function (err) {
                callback(err);
            });

            optimizeProcess.once('exit', function (data) {

                if (data.toString() !== '0') {

                    callback(new Error('Failed To Optimize Image'));

                } else {

                    callback(null);
                }

                optimizeProcess = null;
            });
        };

        var optimizationQueue = [];

        var optimize = function (image, project, callback) {

            if (_.contains(optimizationQueue, project.id + image.id)) return;

            if (!$rootScope.$$phase) {

                $rootScope.$apply(function () {
                    image.status = 'OPTIMIZING';
                });
            } else {

                image.status = 'OPTIMIZING';
            }

            optimizationQueue.push(project.id + image.id);

            setTimeout(function () {

                var imagePath = path.join(project.path, image.path);

                _optimize(imagePath, function (err) {

                    if (err) {

                        optimizationQueue = _.without(optimizationQueue, project.id + image.id);
                        image.status = 'FAILED';

                        setTimeout(function () {
                            callback(true, false);
                        }, 400);


                    } else {

                        fs.stat(imagePath, function (err, stat) {

                            optimizationQueue = _.without(optimizationQueue, project.id + image.id);

                            if (err) {

                                image.status = 'FAILED';
                                return setTimeout(function () {
                                    callback(true, false);
                                }, 400);
                            }

                            image.status = 'OPTIMIZED';
                            image.size = stat.size;
                            setTimeout(function () {
                                callback(null, true);
                            }, 400);

                        });
                    }
                });
            }, 100);
        };

        return {
            optimize: optimize
        };

    }
]);