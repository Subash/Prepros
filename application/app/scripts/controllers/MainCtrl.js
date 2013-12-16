/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false, curly: false*/
/*global prepros,  _ , $, angular, Prepros*/

//App controller
prepros.controller('MainCtrl', [


	'$scope',
	'$rootScope',
	'$route',
	'$routeParams',
	'$location',
	'storage',
	'projectsManager',
    'fileTypes',
	'update',
	'liveServer',
	'watcher',
    'config',
    'log',
    'pro',

	function (
		$scope,
		$rootScope,
		$route,
		$routeParams,
		$location,
		storage,
		projectsManager,
        fileTypes,
		update,
		liveServer,
		watcher,
        config,
        log,
        pro
	) {

		'use strict';

        var fs = require('fs-extra');
        var path = require('path');

		//Global Variables
		$rootScope.PREPROS = window.Prepros;
		$rootScope.LANG = 'en-US';
		$rootScope.UPDATE_AVAILABLE = false;
		$rootScope.UPDATE_CHECKING = true;
		$rootScope.UPDATE_FAILED = false;
        $rootScope._ = window._; //Underscore.js
		$rootScope.updateData = {};
        $rootScope.DISABLE_KEYBOARD_SHORTCUTS = false;

		//Check For Update
		update.checkUpdate(function(data) {

			$rootScope.UPDATE_CHECKING = false;

			if(data.available) {
				$rootScope.UPDATE_AVAILABLE = true;
				$rootScope.UPDATE_DATA = data;
			}

		}, function() {

			$rootScope.UPDATE_CHECKING = false;
			$rootScope.UPDATE_FAILED = true;

		});

        //Log
        $scope.log = log.log;
        $scope.clearLog = log.clear;

		$scope.projects = projectsManager.projects;
		$scope.selectedProject = {};
        $scope.selectedProjectFiles = [];
		$scope.selectedFile = {};
        $scope.selectedProjectImages = [];
        $scope.selectedImage = {};
        $scope.multiSelect = {
            pid: "",
            files: {},
            images: {}
        };
        
        $scope.routePath = '';

        $scope.$on('$routeChangeSuccess', function () {

            if($scope.multiSelect.pid !== $routeParams.pid || $scope.routeSubPath !== $route.current.subPath || $scope.routePath !== $route.current.path) {

                $scope.multiSelect.id = "";
                $scope.multiSelect.files = {};
                $scope.multiSelect.images = {};

            }

            $scope.routePath = $route.current.path;

            if ($scope.routePath === 'FILES' || $scope.routePath === 'PROJECT_OPTIONS' || $scope.routePath === 'IMAGE_OPTIMIZATION') {

                //If project id in the url is in the projects list
                if ($scope.projects[$routeParams.pid]) {

                    $scope.selectedProject = $scope.projects[$routeParams.pid];

                    $scope.selectedProjectImages = _.sortBy($scope.selectedProject.images, function(val, key, object) {
                        return val.name;
                    });

                    //If url contains file id
                    if ($routeParams.fid) {

                        if($scope.selectedProject.files[$routeParams.fid]) {

                            $scope.selectedFile = $scope.selectedProject.files[$routeParams.fid];

                        } else {

                            $scope.selectedFile = {};
                            $location.path('/files/' + $scope.selectedProject.id);
                        }
                    } else {

                        $scope.selectedFile = {};
                    }

                    if ($routeParams.imgid) {

                        if($scope.selectedProject.images[$routeParams.imgid]) {

                            $scope.selectedImage = $scope.selectedProject.images[$routeParams.imgid];

                        } else {

                            $scope.selectedImage = {};
                            $location.path('/images/' + $scope.selectedProject.id);
                        }
                    } else {

                        $scope.selectedImage = {};
                    }

                } else {

                    $scope.selectedProject = {};
                    $scope.selectedFile = {};
                    $scope.selectedImage = {};
                    $scope.selectedProjectFiles =[];
                    $scope.selectedProjectImages =[];
                    $location.path('/home');
                }
            } else {

                $scope.selectedProject = {};
                $scope.selectedFile = {};
                $scope.selectedImage = {};
                $scope.selectedProjectFiles =[];
                $scope.selectedProjectImages =[];

            }

            $scope.selectedProjectFiles = _.sortBy($scope.selectedProject.files, function(val, key, object) {
                return val.name;
            });

            //App Option Section
            if($scope.routePath === 'PROJECT_OPTIONS' || $scope.routePath === 'APP_OPTIONS') {
                $scope.appOptionSubPath = $routeParams.section;
            }
        });

        $scope.$watch('selectedProject.files', function() {

            //Sorted list of project files
            if($scope.selectedProject.files) {

                $scope.selectedProjectFiles = _.sortBy($scope.selectedProject.files, function(val, key, object) {
                    return val.name;
                });
            }

        }, true);

        $scope.$watch('selectedProject.images', function() {

            if($scope.selectedProject.images) {

                $scope.selectedProjectImages = _.sortBy($scope.selectedProject.images, function(val, key, object) {
                    return val.name;
                });
            }
        });

        var throttleProjectsChange = _.throttle(function () {

            liveServer.startServing($scope.projects);

            watcher.startWatching($scope.projects);

            storage.put($scope.projects);

        }, 3000);

        $scope.$watch('projects', function () {

            //Check Routes
            if($routeParams.pid && !$scope.projects[$routeParams.pid]) {

                $location.path('/home');

            } else if($routeParams.pid && $scope.projects[$routeParams.pid]) {

                if($routeParams.fid && !$scope.projects[$routeParams.pid].files[$routeParams.fid]) {

                    $location.path('/files/' + $routeParams.pid);
                }
            }

            throttleProjectsChange();

        }, true);


        //#TODO Move This to relevant place
        $scope.clearMultiSelect = function() {

            $scope.multiSelect.pid = "";
            $scope.multiSelect.images = {};
            $scope.multiSelect.files = {};
            $scope.$apply();

        };

        //Remove Selection if no control key is pressed on click
        $(window).click(function(e) {

            if(!e.ctrlKey) {

                $scope.clearMultiSelect();

            }
        });


        $scope.addMultiSelectFile = function( pid, fid ) {


            var subPath = $scope.routeSubPath ? $scope.routeSubPath.toLowerCase(): 'files';

            $location.path('/' + subPath + '/' + pid); //Redirect to files list view

            $scope.multiSelect.pid = pid;

            if($scope.multiSelect.files[fid]) {

                delete $scope.multiSelect.files[fid];

            } else {

                $scope.multiSelect.files[fid] = { id :fid, pid: pid };

            }
        };

        $scope.addMultiSelectImage = function( pid, img_id ) {

            $location.path('/images/' + pid); //Redirect to image list view

            $scope.multiSelect.pid = pid;

            if($scope.multiSelect.images[img_id]) {

                delete $scope.multiSelect.images[img_id];

            } else {

                $scope.multiSelect.images[img_id] = { id : img_id, pid: pid };

            }
        };


        //Function to show Prepros Pro Required message
        $scope.showProMessage = function(event) {

            pro.showMessage();

            event && event.preventDefault();

        };


        //Add project if any command line argument is passed
        if(Prepros.gui.App.argv[0]) {

            var filePath = Prepros.gui.App.argv[0];

            fs.exists(filePath, function(exists) {
                if(exists && path.dirname(filePath) !== filePath) projectsManager.addProject(filePath);
            });

        }

        //Watch for addProject event
        Prepros.Window.on('addProject', function(data) {

            var filePath = data.path;

            fs.exists(filePath, function(exists) {
                if(exists && path.dirname(filePath) !== filePath) projectsManager.addProject(filePath);
            });
        });


        //Remove non existing files and projects
        if(config.getUserOptions().experimental.autoAddRemoveFile) {

            setTimeout(function() {

                _.each($scope.projects, function(project) {

                    fs.exists(project.path, function (exists) {

                        if(!exists) return $rootScope.$apply(function() { projectsManager.removeProject(project.id);});

                        _.each(project.files, function(file) {

                            var fp = path.join(project.path, file.input);

                            fs.exists(fp, function (exists) {

                                if(!exists) $rootScope.$apply(function() { projectsManager.removeFile(file.pid, file.id);});
                            });

                        });

                        _.each(project.imports, function(imp) {

                            var fp = path.join(project.path, imp.path);

                            fs.exists(fp, function (exists) {

                                if(!exists) $rootScope.$apply(function() { projectsManager.removeImport(imp.pid, imp.id);});
                            });
                        });

                        _.each(project.images, function(img) {

                            var fp = path.join(project.path, img.path);

                            fs.exists(fp, function (exists) {

                                if(!exists) $rootScope.$apply(function() { projectsManager.removeImport(img.pid, img.id);});
                            });
                        });
                    });
                });
            }, 1000);
        }
	}
]);