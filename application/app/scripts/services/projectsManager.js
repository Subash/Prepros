/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros,  _, angular*/

//Storage
prepros.factory('projectsManager', [

  '$location',
  '$rootScope',
  'config',
  'fileTypes',
  'notification',
  'storage',
  'utils',

  function($location, $rootScope, config, fileTypes, notification, storage, utils) {

    'use strict';

    var fs = require('fs-extra');
    var path = require('path');
    var _id = utils.id;
    var minimatch = require('minimatch');

    var projects = storage.get();

    //Function to add new project
    function addProject(folder) {

      //Check if folder already exists in project list
      var already = false;

      _.each(projects, function(project) {

        if (!path.relative(project.path, folder)) {
          already = true;
        }

      });

      var project_id = _id(new Date().toISOString() + folder);

      //If project doesn't exist
      if (!already) {

        //Project to push
        var project = {
          id: project_id,
          cfgVersion: 1, //It's internal configuration version, only change when something is drastically changed in configs
          name: path.basename(folder),
          path: folder,
          files: {},
          imports: {},
          images: {},
          config: {
            watch: true,
            liveRefresh: true,
            liveRefreshDelay: config.getUserOptions().liveRefreshDelay,
            filterPatterns: '',
            useCustomServer: false,
            customServerUrl: '',
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
            autoprefixerBrowsers: config.getUserOptions().autoprefixerBrowsers,
            ftpHost: '',
            ftpPort: '21',
            ftpRemotePath: '',
            ftpUsername: '',
            ftpPassword: '',
            ftpIgnorePreprocessorFiles: true,
            ftpType: 'FTP', //FTP, SFTP
            ftpExcludePatterns: ''
          }
        };
      }

      //Push project to projects list
      projects[project.id] = project;

      refreshProjectFiles(project.id);

      //Redirect to newly added project
      $location.path('/files/' + project.id);
    }

    //Function to get project by it's id
    function getProjectById(id) {

      if (!_.isEmpty(projects[id])) {

        return projects[id];
      }

      return {};
    }

    //function to get all project files
    function getProjectFiles(pid) {

      var project = getProjectById(pid);

      if (!_.isEmpty(project)) {

        return project.files;
      }

      return {};
    }

    //function to get all project imports
    function getProjectImports(pid) {

      var project = getProjectById(pid);

      if (!_.isEmpty(project)) {

        return project.imports;
      }

      return {};
    }

    /**
     * Function to get import By Id
     * @param pid {string} Project Id
     * @param id  {string} Import Id
     */

    function getImportById(pid, id) {

      var imps = getProjectImports(pid);

      if (!_.isEmpty(imps[id])) {

        return imps[id];
      }

      return {};
    }

    /**
     * Function to get file By Id
     * @param pid {string} Project Id
     * @param fid  {string} File Id
     */

    function getFileById(pid, fid) {

      var files = getProjectFiles(pid);

      if (!_.isEmpty(files[fid])) {

        return files[fid];
      }

      return {};
    }

    //Function to get current Project config
    function getProjectConfig(pid) {

      var project = getProjectById(pid);

      if (!_.isEmpty(project)) {

        return project.config;
      }

      return {};
    }

    //Function to get file imports in imports list
    function getFileImports(pid, fid) {

      var allImports = getProjectImports(pid);

      if (!_.isEmpty(allImports)) {

        var fileImports = {};

        _.each(allImports, function(imp) {

          if (_.contains(imp.parents, fid)) {

            fileImports[imp.id] = imp;

          }

        });

        return fileImports;
      }

      return {};
    }

    //Function to match files against global and project specific filters
    function matchFileFilters(pid, file) {

      var projectFilterPatterns = '';

      var project = getProjectById(pid);

      if (_.isEmpty(project)) return true;

      if (project.config.filterPatterns) {

        projectFilterPatterns = project.config.filterPatterns;
      }

      var globalFilterPatterns = config.getUserOptions().filterPatterns.split(',');

      projectFilterPatterns = projectFilterPatterns.split(',');

      var filterPatterns = _.unique(_.union(globalFilterPatterns, projectFilterPatterns));

      var matchFilter = false;

      _.each(filterPatterns, function(pattern) {

        pattern = pattern.trim();

        if (pattern) {

          if (file.indexOf(pattern) !== -1 || minimatch(path.relative(project.path, file), pattern) || minimatch(path.basename(file), pattern)) {

            matchFilter = true;
          }
        }

      });

      return matchFilter;

    }

    /**
     * Function to add a new file to project
     * @param pid {string}  Project id
     * @param filePath {string}  Path to  file
     * @param callback {function} Optional calback function to run after file addition is complete or fail.
     */
    function addFile(pid, filePath, callback) {

      fs.exists(filePath, function(exists) {

        if (exists && fileTypes.isFileSupported(filePath) && fileTypes.getInternalType(filePath) !== "IMAGE" && !matchFileFilters(pid, filePath)) {

          var fileId = _id(path.relative(getProjectById(pid).path, filePath));

          //Check if file already exists in files list
          var already = _.isEmpty(_.findWhere(getProjectFiles(pid), {
            id: fileId
          })) ? false : true;

          var inImports = false;

          var fileExt = path.extname(filePath).toLowerCase();

          var isSass = (fileExt === '.scss' || fileExt === '.sass');

          if (!isSass) {
            inImports = _.isEmpty(_.findWhere(getProjectImports(pid), {
              id: fileId
            })) ? false : true;
          }

          if (!already && !inImports) {

            fileTypes.format(pid, fileId, filePath, getProjectById(pid).path, function(err, formattedFile) {

              if (err) return callback(false, filePath);

              getProjectById(pid).files[fileId] = formattedFile;
              refreshFile(pid, fileId, callback);

            });

          } else {

            if (callback) {
              callback(false, filePath);
            }
          }
        } else {

          if (callback) {
            callback(false, filePath);
          }
        }
      });
    }

    /**
     * @param pid {String} Project ID
     * @param fileId {String} File Id
     * @param callback {Function} Optional callback to run after refresh is complete
     */

    function refreshFile(pid, fileId, callback) {

      if (!_.isEmpty(getFileById(pid, fileId))) {

        var fPath = path.join(getProjectById(pid).path, getFileById(pid, fileId).input);

        fileTypes.getImports(fPath, function(err, fileImports) {

          if (err) {
            fileImports = [];
          }

          var oldImports = getFileImports(pid, fileId);

          _.each(fileImports, function(imp) {

            addImport(pid, fileId, imp);

          });

          _.each(oldImports, function(imp) {

            var fullImpPath = path.join(getProjectById(pid).path, imp.path);

            if (!_.contains(fileImports, fullImpPath)) {

              removeImportParent(imp.pid, imp.id, fileId);

              addFile(pid, fullImpPath, callback);
            }
          });

          if (callback) {
            callback(true, fPath);
          }

        });

      } else {

        if (callback) {

          setTimeout(function() {
            callback(false, fPath);
          }, 0);
        }
      }
    }

    /**
     * Resets the settings of a file to defaults
     * @param pid {string} Project id
     * @param id {string} File id
     */

    //Function to remove a file
    function removeFile(pid, id) {

      if (!_.isEmpty(getProjectById(pid))) {

        delete getProjectFiles(pid)[id];

        //Remove file from imports parent list
        removeParentFromAllImports(pid, id);
      }

    }

    //Function to remove file from import parent
    function removeParentFromAllImports(pid, fid) {

      _.each(getProjectImports(pid), function(imp) {

        removeImportParent(pid, imp.id, fid);

      });

    }

    //Remove parent from certain import
    function removeImportParent(pid, impid, fid) {

      var project = getProjectById(pid);

      var projectImports = project.imports;

      var importedFile = _.findWhere(projectImports, {
        id: impid
      });

      importedFile.parents = _.without(importedFile.parents, fid);

      //Remove import if parent list is empty
      if (_.isEmpty(importedFile.parents)) {
        removeImport(pid, impid);
      }
    }

    //function to add imported file to import list
    function addImport(pid, fid, importedPath) {

      //If @imported file is not in imports list create new entry otherwise add the file as parent
      var projectImports = getProjectImports(pid);

      var impid = _id(path.relative(getProjectById(pid).path, importedPath));

      if (impid in projectImports) {

        if (!_.contains(projectImports[impid].parents, fid)) {

          projectImports[impid].parents.push(fid);
        }

      } else {

        getProjectById(pid).imports[impid] = {
          id: impid,
          pid: pid,
          path: path.relative(getProjectById(pid).path, importedPath),
          parents: [fid]
        };
      }

      var fileExt = path.extname(importedPath).toLowerCase();

      var isSass = (fileExt === '.scss' || fileExt === '.sass');

      //Remove any file that is in files list and is imported by this file
      if (!isSass) {
        removeFile(pid, impid);
      }
    }

    /**
     * Function to remove Import
     * @param pid {string} Project Id
     * @param impid {string} Import Id
     */
    function removeImport(pid, impid) {

      delete getProjectImports(pid)[impid];
    }

    //Function that refreshes files in a project folder
    function refreshProjectFiles(pid) {

      utils.showLoading();

      var folder = getProjectById(pid).path;

      fs.exists(folder, function(exists) {

        if (exists) {

          var filesImportsImages = [];

          _.each(getProjectFiles(pid), function(file) {

            filesImportsImages.push(file);

          });

          _.each(getProjectImages(pid), function(file) {

            filesImportsImages.push(file);

          });

          _.each(getProjectImports(pid), function(file) {

            filesImportsImages.push(file);

          });

          //Remove file that doesn't exist or matches the filter pattern
          _.each(filesImportsImages, function(file) {

            var filePath;

            if (file.input) filePath = path.join(folder, file.input);
            if (file.path) filePath = path.join(folder, file.path);

            //Remove if matches filter patterns or doesn't exist
            if (matchFileFilters(pid, filePath)) {

              if (file.input) removeFile(pid, file.id);
              if (_.isArray(file.parents)) removeImport(pid, file.id);
              else removeImage(pid, file.id);


            } else {

              fs.exists(filePath, function(exists) {

                if (!exists) {

                  $rootScope.$apply(function() {

                    if (file.input) removeFile(pid, file.id);
                    if (_.isArray(file.parents)) removeImport(pid, file.id);
                    else removeImage(pid, file.id);
                  });
                }
              });
            }
          });

          utils.readDirs(folder, function(err, files) {

            if (err) {

              notification.error('Error ! ', 'An error occurred while scanning files', err.message);
              utils.hideLoading();

            } else {

              var total = files.length;

              //Hide loader if there are no files
              if (!total) {
                return utils.hideLoading();
              }


              var hideIfFinished = function() {

                //Hide Loader if there are no files
                if (!total) {
                  setTimeout(function() {
                    $rootScope.$apply(function() {
                      utils.hideLoading();
                    });
                  }, 200);
                }

              };

              _.each(files, function(file) {

                if (fileTypes.isFileSupported(file) && !matchFileFilters(pid, file)) {

                  //Generate unique id for file
                  var file_id = _id(path.relative(getProjectById(pid).path, file));

                  var already = false;

                  if (fileTypes.getInternalType(file) === 'IMAGE') {

                    already = !_.isEmpty(getImageById(pid, file_id));

                    if (already) {

                      refreshImage(pid, file_id, function() {

                        --total;

                        hideIfFinished();
                      });

                    } else {

                      addImage(pid, file, function() {

                        --total;

                        hideIfFinished();
                      });
                    }

                  }

                  already = !_.isEmpty(getFileById(pid, file_id));

                  if (already) {

                    refreshFile(pid, file_id, function(complete, fp) {

                      --total;

                      hideIfFinished();
                    });

                  } else {

                    addFile(pid, file, function(complete, fp) {

                      --total;

                      hideIfFinished();
                    });
                  }
                } else {

                  --total;

                  hideIfFinished();
                }
              });
            }
          });

        } else {

          $rootScope.$apply(function() {
            removeProject(pid);
          });

          utils.hideLoading();
        }
      });
    }

    //Function to remove project
    function removeProject(pid) {

      delete projects[pid];
    }

    //Function to change file output path
    function changeFileOutput(pid, id, newPath) {

      var file = getFileById(pid, id);

      if (!_.isEmpty(file)) {

        if (path.extname(path.basename(newPath)) === '') {

          newPath = newPath + fileTypes.getCompiledExtension(file.input);
        }

        file.customOutput = newPath;
      }
    }


    //function to get all project files
    function getProjectImages(pid) {

      var project = getProjectById(pid);

      if (!_.isEmpty(project)) {

        return project.images;
      }

      return [];
    }

    //Function to add image to project
    function addImage(pid, filePath, callback) {

      var project = getProjectById(pid);

      var id = _id(path.relative(project.path, filePath));

      if (fileTypes.getInternalType(filePath !== 'IMAGE') || getProjectImages(pid)[id]) return setTimeout(function() {
        callback(false, filePath);
      }, 0);

      var ext = path.extname(filePath).slice(1);

      fs.stat(filePath, function(err, stat) {

        if (err) return callback(false, filePath);

        project.images[id] = {

          id: id,
          pid: pid,
          path: path.relative(project.path, filePath),
          size: stat.size,
          name: path.basename(filePath),
          type: ext.charAt(0).toUpperCase() + ext.slice(1),
          initialSize: stat.size,
          status: 'NOT_OPTIMIZED' //NOT_OPTIMIZED, OPTIMIZED, OPTIMIZING, FAILED
        };

        callback(true, filePath);

      });

    }

    //Function to refresh Image
    function refreshImage(pid, imageId, callback) {

      var project = getProjectById(pid);

      if (!project.images[imageId]) return setTimeout(function() {
        callback(false);
      }, 0);

      var image = project.images[imageId];

      var imagePath = path.join(project.path, image.path);

      fs.stat(imagePath, function(err, stat) {

        if (err) {

          removeImage(pid, imageId);
          return callback(false, imagePath);

        }

        if (stat.size.toString() !== image.size.toString()) {

          image.status = 'NOT_OPTIMIZED';

        }

        callback(true, imagePath);

      });
    }

    //Get image by id
    function getImageById(pid, fid) {

      var images = getProjectImages(pid);

      if (!_.isEmpty(images[fid])) {

        return images[fid];
      }

      return {};
    }

    //Funtion to remove Image
    function removeImage(pid, imageId) {

      if (!_.isEmpty(getProjectById(pid))) {

        delete getProjectImages(pid)[imageId];
      }

    }

    return {
      projects: projects,

      getProjectById: getProjectById,
      getFileById: getFileById,
      getImportById: getImportById,
      getImageById: getImageById,

      addProject: addProject,
      addFile: addFile,
      addImage: addImage,
      refreshImage: refreshImage,
      refreshFile: refreshFile,

      removeFile: removeFile,
      removeProject: removeProject,
      removeImport: removeImport,

      refreshProjectFiles: refreshProjectFiles,
      getProjectFiles: getProjectFiles,
      getProjectConfig: getProjectConfig,
      changeFileOutput: changeFileOutput,
      matchFilters: matchFileFilters
    };
  }
]);
