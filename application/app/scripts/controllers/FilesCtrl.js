/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros, Prepros,  _ , $*/

//Files List controls
prepros.controller('FilesCtrl', [

    '$scope',
    '$filter',
    'compiler',
    'projectsManager',
    'utils',
    'pro',
    'imageOptimization',

    function ($scope, $filter, compiler, projectsManager, utils, pro, imageOptimization) {

        'use strict';

        var fs = require('fs'),
            path = require('path');

        //Open file with default editor
        $scope.openFile = function (pid, fid) {

            var project = projectsManager.getProjectById(pid);

            var file = projectsManager.getFileById(pid, fid);

            Prepros.gui.Shell.openExternal(path.join(project.path, file.input));

        };

        //Open image with default previewer
        $scope.openImage = function (pid, imgid) {

            var project = projectsManager.getProjectById(pid);

            var image = projectsManager.getImageById(pid, imgid);

            Prepros.gui.Shell.openExternal(path.join(project.path, image.path));

        };

        //Toggle Auto Compile
        $scope.toggleAutoCompile = function (pid, fid) {

            var file = projectsManager.getFileById(pid, fid);

            file.config.autoCompile = !file.config.autoCompile;

        };

        $scope.showInFolder = function (pid, fid) {

            var project = projectsManager.getProjectById(pid);

            var file = projectsManager.getFileById(pid, fid);

            Prepros.gui.Shell.showItemInFolder(path.join(project.path, file.input));

        };

        $scope.showImageInFolder = function (pid, imageId) {

            var project = projectsManager.getProjectById(pid);

            var image = projectsManager.getImageById(pid, imageId);

            Prepros.gui.Shell.showItemInFolder(path.join(project.path, image.path));

        };

        //Compile file
        $scope.compile = function (pid, fid) {
            compiler.compile(pid, fid);
        };

        $scope.optimizeImage = function (pid, imageId) {

            var image = projectsManager.getImageById(pid, imageId);
            var project = projectsManager.getProjectById(pid);

            imageOptimization.optimize(image, project, function () {
                $scope.$apply();
            });

        };

        //Reset File Options
        $scope.resetFileSettings = function (pid, fid, no_prompt) {

            var file = projectsManager.getFileById(pid, fid);
            var project = projectsManager.getProjectById(pid);

            var fpath = path.join(project.path, file.input);

            if (no_prompt) {

                projectsManager.removeFile(pid, fid);
                projectsManager.addFile(pid, fpath, function () {
                    $scope.$apply();
                });
                return;
            }

            var confirmMsg = utils.notifier.notify({
                message: "Are you sure you want to reset the settings of this file?",
                type: "warning",
                buttons: [
                    {'data-role': 'ok', text: 'Yes'},
                    {'data-role': 'cancel', text: 'Cancel'}
                ],
                destroy: true
            });

            confirmMsg.on('click:ok', function () {

                this.destroy();
                projectsManager.removeFile(pid, fid);
                projectsManager.addFile(pid, fpath, function () {
                    $scope.$apply();
                });
            });

            confirmMsg.on('click:cancel', 'destroy');
        };

        //Change file output
        $scope.changeFileOutput = function (pid, id, event) {

            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            var wd;

            var file = projectsManager.getFileById(pid, id),
                project = projectsManager.getProjectById(pid);


            if (file.config.compass && file.config.fullCompass) {

                var confirmMsg = utils.notifier.notify({
                    message: "Output path can't be changed from UI if file has full compass support enabled. Use Compass config.rb file to change output path",
                    type: "info",
                    buttons: [
                        {'data-role': 'ok', text: 'Ok'}
                    ],
                    destroy: true
                });

                confirmMsg.on('click:ok', 'destroy');

                return;
            }

            var out = '';

            //Interpolate path to replace css/js dirs
            if (file.customOutput) {

                out = path.resolve(project.path, file.customOutput);

            } else {

                out = $filter('interpolatePath')(file.input, project);

            }

            fs.exists(path.dirname(out), function (exists) {

                if (exists) {
                    wd = path.dirname(out);
                } else {
                    wd = project.path;
                }

                var elm = $('<input type="file" nwsaveas nwworkingdir="' + wd + '">');

                elm.trigger('click');

                $(elm).on('change', function (e) {

                    var output = e.currentTarget.files[0].path;

                    if (utils.isFileInsideFolder(project.path, output)) {

                        output = path.relative(project.path, output);
                    }

                    $scope.$apply(function () {
                        projectsManager.changeFileOutput(pid, id, output);
                    });
                });
            });
        };
    }
]);