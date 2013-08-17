/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros,  _, angular*/

//Storage
prepros.factory('projectsManager', function (config, storage, fileTypes, notification, utils, $rootScope, $location) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        _id = utils.id;

    var projects = storage.get();

    var _broadCast = function () {
        $rootScope.$broadcast('dataChange', {projects: projects});
    };

    //Function to add new project
    function addProject(folder) {

        //Check if folder already exists in project list
        var already = _.isEmpty(_.findWhere(projects, {path: folder})) ? false : true;

        var project_id = _id(new Date().toISOString() + folder);

        //If project doesn't exist
        if (!already) {

            var project = {};

            //Try to read prepros.json file
            if(fs.existsSync(folder + path.sep + 'prepros.json')) {

                try {

                    project = JSON.parse(fs.readFileSync(folder + path.sep + 'prepros.json'));

                } catch(e) {}
            }

            if(project.id) {

                project.path = folder;

            } else {

                //Project to push
                project = {
                    id: project_id,
                    name: path.basename(folder),
                    path: folder,
                    files: [],
                    imports: [],
                    config: {
                        liveRefresh: true,
                        liveRefreshDelay: config.getUserOptions().liveRefreshDelay,
                        filterPatterns: '',
                        useCustomServer: false,
                        customServerUrl: '',
                        cssPath: config.getUserOptions().cssPath,
                        jsPath: config.getUserOptions().jsPath,
                        htmlPath: config.getUserOptions().htmlPath,
                        jsMinPath: config.getUserOptions().jsMinPath,
                        autoprefixerBrowsers: config.getUserOptions().autoprefixerBrowsers
                    }
                };
            }

            //Push project to projects list
            projects.push(project);

            refreshProjectFiles(project.id);

            //Redirect to newly added project
            $location.path('/files/' + project.id);

            _broadCast();
        }
    }

    //Function to get project by it's id
    function getProjectById(id) {
        return _.findWhere(projects, {id: id});
    }

    //function to get all project files
    function getProjectFiles(pid) {
        return getProjectById(pid).files;
    }

    //function to get all project imports
    function getProjectImports(pid) {
        return getProjectById(pid).imports;
    }

    /**
     * Function to get import By Id
     * @param pid {string} Project Id
     * @param id  {string} Import Id
     */

    function getImportById(pid, id) {
        return _.findWhere(getProjectById(pid).imports, {id: id});
    }

    /**
     * Function to get file By Id
     * @param pid {string} Project Id
     * @param fid  {string} File Id
     */

    function getFileById(pid, fid) {
        return _.findWhere(getProjectById(pid).files, {id: fid});
    }

    //Function to get current Project config
    function getProjectConfig(pid) {
        return getProjectById(pid).config;
    }

    //Function to get file imports in imports list
    function getFileImports(pid, fid) {

        return _.filter(getProjectById(pid).imports, function (im) {
            return _.contains(im.parents, fid);
        });
    }

    //Function to match files against global and project specific filters
    function matchFileFilters(pid, file) {

        var projectFilterPatterns = '';

        if (getProjectById(pid).config.filterPatterns) {

            projectFilterPatterns = getProjectById(pid).config.filterPatterns;
        }

        var globalFilterPatterns = config.getUserOptions().filterPatterns.split(',');

        projectFilterPatterns = projectFilterPatterns.split(',');

        var filterPatterns = _.unique(_.union(globalFilterPatterns, projectFilterPatterns));

        var matchFilter = false;

        _.each(filterPatterns, function (pattern) {

            pattern = pattern.trim();

            if (pattern !== "" && file.indexOf(pattern) !== -1) {

                matchFilter = true;

            }

        });

        return matchFilter;

    }

    /**
     * Function to add a new file to project
     * @param {string} pid  Project id
     * @param {string} fileId  File id
     * @param {string} filePath  Path to  file
     */
    function addFile(pid, fileId, filePath) {

        //Check if file already exists in files list
        var already = _.isEmpty(_.findWhere(getProjectFiles(pid), {id: fileId})) ? false : true;

        var inImports = _.isEmpty(_.findWhere(getProjectImports(pid), {id: fileId})) ? false : true;

        if (!already && !inImports) {

            try {
                getProjectById(pid).files.push(fileTypes.format(pid, fileId, filePath, getProjectById(pid).path));
            }
             catch(e ){
                 console.log(e.stack);
            }

        }
    }

    /**
     * Resets the settings of a file to defaults
     * @param pid {string} Project id
     * @param fid {string} File id
     */

    function resetFileSettings(pid, fid) {
        var f = getFileById(pid, fid);
        removeFile(pid, fid);
        addFile(pid, f.id, f.input);
        _broadCast();
    }

    //Function to remove a file
    function removeFile(pid, id) {

        if (!_.isEmpty(getProjectById(pid))) {

            getProjectById(pid).files = _.reject(getProjectById(pid).files, function (file) {
                return file.id === id;
            });

            //Remove file from imports parent list
            removeParentFromAllImports(pid, id);

            _broadCast();
        }

    }

    //Function to remove file from import parent
    function removeParentFromAllImports(pid, fid) {

        _.each(getProjectImports(pid), function (imp) {

            removeImportParent(pid, imp.id, fid);

        });

    }

    //Remove parent from certain import
    function removeImportParent(pid, impid, fid) {

        var project = getProjectById(pid);

        var projectImports = project.imports;

        var importedFile = _.findWhere(projectImports, {id: impid});

        importedFile.parents = _.without(importedFile.parents, fid);

        //Remove import if parent list is empty
        if(_.isEmpty(importedFile.parents)) {
            removeImport(pid, impid);
        }

        _broadCast();
    }

    //function to add imported file to import list
    function addImport(pid, fid, importedPath) {

        //If @imported file is not in imports list create new entry otherwise add the file as parent
        var projectImports = getProjectById(pid).imports;

        var impid = _id(path.relative(getProjectById(pid).path, importedPath));

        if (_.isEmpty(_.findWhere(projectImports, {id: impid}))) {

            getProjectById(pid).imports.push({
                id: impid,
                pid: pid,
                path: path.relative(getProjectById(pid).path, importedPath),
                parents: [fid]
            });

        } else {

            if (!_.contains(_.findWhere(getProjectById(pid).imports, {id: impid}).parents, fid)) {
                _.findWhere(getProjectById(pid).imports, {id: impid}).parents.push(fid);
            }

        }

        //Remove any file that is in files list and is imported by this file
        removeFile(pid, impid);

    }

    /**
     * Function to remove Import
     * @param pid {string} Project Id
     * @param impid {string} Import Id
     */
    function removeImport(pid, impid) {

        //Reject projects from list
        getProjectById(pid).imports = _.reject(getProjectById(pid).imports, function (imp) {
            return imp.id === impid;
        });
        _broadCast();
    }

    /**
     * Function to get all files inside project folder
     * @param folder {string} Path to folder
     * @returns {Array}
     */

    function getFilesInDir(folder) {

        var f = [];

        function get(dir) {

            var files = fs.readdirSync(dir);

            files.forEach(function (file) {

                var fp = dir + path.sep + file;

                if (fs.statSync(fp).isDirectory()) {

                    get(fp);

                } else {

                    if (fileTypes.isFileSupported(fp)) {
                        f.push(fp);
                    }
                }
            });
        }

        try {

            get(folder);

        } catch (e) {

            notification.error('Error ! ', 'An error occurred while scanning files', e.message);

        }

        return f;
    }

    //Function that refreshes files in a project folder
    function refreshProjectFiles(pid) {

        utils.showLoading();

        process.nextTick(function() {

            var folder = getProjectById(pid).path;

            //Remove file that doesn't exist or matches the filter pattern
            _.each(getProjectFiles(pid), function (file) {

                //Remove if matches filter patterns or doesn't exist
                if (matchFileFilters(pid, path.join(folder, file.input)) || !fs.existsSync(path.join(folder, file.input))) {

                    removeFile(pid, file.id);

                }

            });

            if (fs.existsSync(folder)) {

                var projectFiles = getFilesInDir(folder);

                var filesToAdd = [];

                _.each(projectFiles, function (file) {

                    if (!matchFileFilters(pid, file)) {

                        filesToAdd.push({
                            path: file,
                            imports: fileTypes.getImports(file, folder)
                        });
                    }
                });

                //Check if file is in the imports list of another file
                //If it is ignore the file
                var importsOfAllFiles = _.uniq(_.flatten(_.pluck(filesToAdd, 'imports')));

                _.each(filesToAdd, function (file) {

                    //Generate unique id for file
                    var file_id = _id(path.relative(getProjectById(pid).path, file.path));

                    //Check
                    if (!_.contains(importsOfAllFiles, file.path)) {

                        //Add file
                        addFile(pid, file_id, file.path);

                        //Add imports
                        _.each(file.imports, function (imp) {
                            addImport(pid, file_id, imp);
                        });
                    }

                    //Remove any previously imported file that is not imported anymore
                    var oldImports = getFileImports(pid, file_id);

                    _.each(oldImports, function (imp) {

                        if (!_.contains(file.imports, path.join(folder, imp.path))) {

                            removeImportParent(imp.pid, imp.id, file_id);
                        }
                    });
                });

                $rootScope.$apply(function() {
                    _broadCast();
                });

                utils.hideLoading();

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

        if (!_.isEmpty(_.findWhere(projects, {id: pid}))) {

            //Reject projects from list
            projects = _.reject(projects, function (project) {
                return project.id === pid;
            });
        }

        _broadCast();
    }

    //Function to change file output path
    function changeFileOutput(pid, id, newPath) {

        var file = getFileById(pid, id);

        if (path.extname(path.basename(newPath)) === '') {

            newPath = newPath + fileTypes.getCompiledExtension(file.input);
        }

        file.output = newPath;
    }

    //Function to create Project Config File
    function createProjectConfigFile(project) {
        try {
            fs.outputFile(project.path + path.sep + 'prepros.json', angular.toJson(_.omit(project, 'path'), true));
        } catch(e) {
            //Do nothing
        }

    }

    return {
        projects: projects,

        getProjectById: getProjectById,
        getFileById: getFileById,
        getImportById: getImportById,

        addProject: addProject,
        addFile: addFile,

        removeFile: removeFile,
        removeProject: removeProject,
        removeImport: removeImport,

        refreshProjectFiles: refreshProjectFiles,
        getProjectFiles: getProjectFiles,
        getProjectConfig: getProjectConfig,
        changeFileOutput: changeFileOutput,
        matchFilters: matchFileFilters,
        resetFileSettings: resetFileSettings,
        createProjectConfigFile: createProjectConfigFile
    };
});
