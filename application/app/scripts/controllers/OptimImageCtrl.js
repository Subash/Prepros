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
    var jpegtran = path.join(config.basePath, 'bin/jpegtran/win32/jpegtran.exe');
    var optipng = path.join(config.basePath, 'bin/optipng/win32/optipng.exe');

    if (process.platform !== 'win32') {

        jpegtran = path.join(config.basePath, 'bin/jpegtran/osx/jpegtran');
        optipng = path.join(config.basePath, 'bin/optipng/osx/optipng');

    }

    if(process.platform === 'win32' && process.arch === 'x64') {

       jpegtran = path.join(config.basePath, 'bin/jpegtran/win64/jpegtran');
    }

    var cp = require('child_process');

    $scope.projectImages = [];

    var jpg = ['jpg', 'jpeg'];

    var png = ['png','gif','tif','tiff'];

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

    $scope.optimize = function(e, file) {


        $(e.currentTarget).addClass('optimizing');
        $(e.currentTarget).children('span').text('');

        var cmd = [];
        var executable;
        var ext = path.extname(file).slice(1);

        if(_.contains(png, ext)) {

            executable = optipng;
            cmd = [file];

        } else {

            executable = jpegtran;
            cmd = ['-outfile', file, '-optimize', file];

        }

        cp.execFile(executable, cmd, function(err) {

            $(e.currentTarget).removeClass('optimizing');

            if(err) {

                $(e.currentTarget).addClass('failed');
                $(e.currentTarget).children('span').text('Failed');

            } else {

                $(e.currentTarget).addClass('done');
                $(e.currentTarget).children('span').text('Done');
            }
        });
    };

    $scope.$on('$routeChangeSuccess', function () {

        var projectExists = !_.isEmpty(_.findWhere($scope.projects, {id: $routeParams.pid}));

        if($route.current.path === 'optim' &&  projectExists) {

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