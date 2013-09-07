/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ , $, angular*/

//App controller
prepros.controller('MainCtrl', [


    '$scope',
    '$route',
    '$routeParams',
    '$location',
    'storage',
    'projectsManager',
    'liveServer',
    'watcher',

    function (
        $scope,
        $route,
        $routeParams,
        $location,
        storage,
        projectsManager,
        liveServer,
        watcher
    ) {

        'use strict';

        var fs = require('fs-extra');
        var path = require('path');

        //Files and projects
        $scope.projects = projectsManager.projects;
        $scope.selectedFile = {};
        $scope.selectedProject = {};

        //Data Change
        var throttleProjectsChange = _.throttle(function () {

            //storage.saveProjects($scope.projects);
            liveServer.startServing($scope.projects);

            watcher.startWatching($scope.projects);

            storage.put($scope.projects);

        }, 2000);

        $scope.$watch('projects', function () {

            throttleProjectsChange();

        }, true);

        $scope.$on('dataChange', function (event, data) {

            $scope.projects = data.projects;

            if ($scope.selectedProject.id) {

                var projectExists = _.findWhere($scope.projects, {id: $scope.selectedProject.id});

                if (!projectExists) {

                    $scope.selectedProject = {};
                    $location.path('/home');

                }
            }

            if ($scope.selectedFile.id) {

                var fileExists = _.findWhere($scope.selectedProject.files, {id: $scope.selectedFile.id});

                if (!fileExists) {

                    $location.path('/files/' + $scope.selectedFile.pid);

                    $scope.selectedFile = {};
                }
            }
        });

        $scope.$on('$routeChangeSuccess', function () {

            $scope.path = $route.current.path;

            if ($scope.path === 'files' || $scope.path === 'optim') {

                var projectExists = !_.isEmpty(_.findWhere($scope.projects, {id: $routeParams.pid}));

                //If project id in the url is in the projects list
                if (projectExists) {

                    $scope.selectedProject = _.findWhere($scope.projects, {id: $routeParams.pid});

                    //If url contains file id
                    if ($routeParams.fid) {

                        var fileExists = !_.isEmpty(_.findWhere($scope.selectedProject.files, {id: $routeParams.fid}));

                        //If file id is in the file list
                        if (fileExists) {

                            $scope.selectedFile = _.findWhere($scope.selectedProject.files, {id: $routeParams.fid});


                        } else {

                            //If file is not in the file list redirect to project files list
                            $location.path('/files/' + $scope.selectedProject.id);

                        }
                    } else {

                        $scope.selectedFile = {};
                    }

                } else {

                    //If project id is not in the list redirect to home
                    $location.path('/home');

                }
            } else {

                $scope.selectedProject = {};
            }

        });
    }
]);