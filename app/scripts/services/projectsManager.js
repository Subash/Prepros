/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros,  _*/

//Storage
prepros.factory('projectsManager', function (config, storage, fileTypes, notification, utils, importsVisitor, $rootScope, $location) {

    'use strict';

    var fs = require('fs'),
        path = require('path'),
        walker = require('node-walker'),
        _id = utils.id;

    //Projects List
    var projects = storage.getProjects();

    //Files List
    var files = storage.getFiles();

    //Imports List
    var imports = storage.getImports();

    //Remove any project that no longer exists
    _.each(projects, function(project){

        if(!fs.existsSync(project.path)){

            removeProject(project.id);
        }

    });

    //Remove any file that no longer exists
    _.each(files, function(file){

        if(!fs.existsSync(file.input)){

            removeFile(file.id);
        }

    });


    //Remove any import that no longer exists
    _.each(imports, function(imported){

        if(!fs.existsSync(imported.path)){

            removeImport(imported.path);
        }

    });

    //Function to add new project
    function addProject(folder) {

        //Check if folder already exists in project list
        var already = _.isEmpty(_.findWhere(projects, {path: folder})) ? false : true;

        //If project doesn't exist
        if (!already) {

            //Project to push
            var project = {
                id: _id(folder),
                name: path.basename(folder),
                path: folder,
                config: {
                    liveRefresh: true,
                    filterPatterns: '',
                    useCustomServer: false,
                    customServerUrl: ''
                }
            };

            //Push project to projects list
            projects.push(project);

            refreshProjectFiles(project.id);

            //Redirect to newly added project
            $location.path('/files/' + _id(folder));

            //Broadcast data change event
            $rootScope.$broadcast('dataChange', {projects: projects, files: files, imports: imports});
        }
    }

    //Function to remove project
    function removeProject(pid) {

        if (!_.isEmpty(_.findWhere(projects, {id: pid}))) {

            //Reject projects from list
            projects = _.reject(projects, function (project) {
                return project.id === pid;
            });

            removeProjectFiles(pid);

            //Broadcast data change event
            $rootScope.$broadcast('dataChange', {projects: projects, files: files, imports: imports});
        }
    }

    //function to get all project files
    function getProjectFiles(pid){
        return _.where(files, {pid : pid});
    }

    //Function to remove project files
    function removeProjectFiles(pid) {

        if (!_.isEmpty(_.where(files, {pid: pid}))) {

            //Reject the file from list
            files = _.reject(files, function (file) {
                return file.pid === pid;
            });

            //Reject the imports from list
            imports = _.reject(imports, function (imp) {
                return imp.pid === pid;
            });

            //Broadcast data change event
            $rootScope.$broadcast('dataChange', {projects: projects, files: files, imports: imports});
        }
    }

    //Function to get project by it's id
    function getProjectById(id) {
        return _.findWhere(projects, {id: id});
    }

    //Function to get file by its id
    function getFileById(id) {
        return _.findWhere(files, {id: id});
    }

    //Function to get file by its id
    function getImportById(id) {
        return _.findWhere(imports, {id: id});
    }

    //Function to remove a file
    function removeFile(id) {

        if (!_.isEmpty(_.findWhere(files, {id: id}))) {

            //Reject the file from list
            files = _.reject(files, function (file) {
                return file.id === id;
            });

            //Remove file from imports parent list
            removeParentFromAllImports(id);

            //Broadcast data change event
            $rootScope.$broadcast('dataChange', {projects: projects, files: files, imports: imports});
        }

    }

    //Function to remove a import file
    function removeImport(id) {

        if (!_.isEmpty(_.findWhere(imports, {id: id}))) {

            //Reject import from imports list
            imports = _.reject(imports, function (imp) {
                return imp.id === id;
            });

            //Broadcast data change event
            $rootScope.$broadcast('dataChange', {projects: projects, files: files, imports: imports});
        }

    }

    //Function to get file imports in imports list
    function getFileImports(fid){

        return _.filter(imports, function(im){
            return _.contains(im.parents, fid);
        });
    }


    //Function to remove file from import parent
    function removeParentFromAllImports(fid){

        _.each(imports, function (imp) {

            removeImportParent(imp.id, fid);

        });

    }

    //Remove parent from certain import
    function removeImportParent(impid, fid){

        var imported = _.findWhere(imports, {id: impid});

        var newImports = _.reject(imports, function (imp) {

            return imported.path === imp.path;

        });

        imported.parents = _.without(imported.parents, fid);

        //If after removing one file as parent the parents list becomes empty remove whole import item
        if (!_.isEmpty(imported.parents)) {

            newImports.push(imported);

        }

        imports = newImports;

    }

    //Function to get all files inside project folder
    function getProjectFolderFiles(pid, callback) {

        var folder = getProjectById(pid).path;

        var filesList = [];

        //Get all files in project folder
        walker(folder, function (err, file, next) {

            //Ouch error occurred
            if (err) {

                notification.error('Error ! ', 'An error occurred while scanning files', err.message);
            }

            //Add file to project
            if (file !== null) {

                var extname = path.extname(file).toLowerCase();
                var supportedExtensions = [
                    '.less', //Less
                    '.sass', '.scss', //Sass
                    '.styl', //Stylus
                    '.md', '.markdown', //Markdown
                    '.coffee', //Coffeescript
                    '.jade', //Jade
                    '.haml',  //Haml
                    '.slim'  //Slim
                ];

                if (_.contains(supportedExtensions, extname)) {

                    filesList.push(path.normalize(file));

                }
            }

            //Next file
            if (next) {

                next();

            } else {

                callback(filesList);

            }

        });
    }

    //Function to match files against global and project specific filters
    function matchFileFilters(pid, file) {

        var folder = getProjectById(pid).path;

        var projectFilterPatterns = '';

        if(getProjectById(pid).config.filterPatterns) {

            projectFilterPatterns = getProjectById(pid).config.filterPatterns;
        }

        var globalFilterPatterns = config.getUserOptions().filterPatterns.split(',');

        projectFilterPatterns = projectFilterPatterns.split(',');

        var filterPatterns = _.unique(_.union(globalFilterPatterns, projectFilterPatterns));

        var matchFilter = false;

        _.each(filterPatterns, function(pattern){

            pattern = pattern.trim();

            if(pattern !=="" && file.indexOf(pattern) !== -1) {

                matchFilter = true;

            }

        });

        return matchFilter;

    }



    //Function that walks and returns all files in a folder
    function refreshProjectFiles(pid) {
        
        var folder = getProjectById(pid).path;

        //Remove file that doesn't exist or matches the filter pattern
        _.each(getProjectFiles(pid), function(file){

            //Remove if matches filter patterns or doesn't exist
            if (matchFileFilters(pid, file.input) || !fs.existsSync(file.input)){

                removeFile(file.id);

            }

        });

        utils.showLoading();

        if(fs.existsSync(folder)) {

            getProjectFolderFiles(pid, function(files){

                var filesToAdd = [];

                _.each(files, function(file) {

                    if (!matchFileFilters(pid, file)) {

                        filesToAdd.push(path.normalize(file));

                    }

                });

                //Add files
                if (!_.isEmpty(filesToAdd)) {

                    _.each(filesToAdd, function(parentFile){

                        var fileImports = [];

                        //Get file imports
                        fileImports = _.union(fileImports, importsVisitor.visitImports(parentFile));

                        //Get imports of imports
                        _.each(fileImports, function(importedFile){

                            fileImports = _.union(fileImports, importsVisitor.visitImports(importedFile));

                        });

                        //Get imports of imports of imports
                        _.each(fileImports, function(importedFile){

                            fileImports = _.union(fileImports, importsVisitor.visitImports(importedFile));

                        });

                        //Remove repeated imports
                        fileImports = _.uniq(fileImports);

                        //Add imports to import list
                        _.each(fileImports, function(imported){

                            addFileImport(folder, parentFile, imported);

                        });

                        //Remove any previously imported file that is not imported anymore
                        var oldImports = getFileImports(_id(parentFile));

                        _.each(oldImports, function(imp){

                            if(!_.contains(fileImports, imp.path)){

                                removeImportParent(imp.id, _id(parentFile));
                            }
                        });
                    });

                    addFiles(filesToAdd, folder);
                }

                utils.hideLoading();

            });
        } else {

            removeProject(pid);

            utils.hideLoading();

        }
    }


    //function to add imported file to import list
    function addFileImport(projectPath, parentPath, importedPath){

        //If @imported file is not in imports list create new entry otherwise add this file as parent
        if (_.isEmpty(_.findWhere(imports, {path: importedPath}))) {

            imports.push({
                id: _id(importedPath),
                pid: _id(projectPath),
                path: importedPath,
                parents: [_id(parentPath)]
            });

        } else {

            var im = _.findWhere(imports, {path: importedPath});

            if (!_.contains(im.parents, _id(parentPath))) {
                im.parents.push(_id(parentPath));
            }

            //Remove old import file without new parent
            var newImports = _.reject(imports, function (imp) {
                return imp.path === importedPath;
            });

            //Push new import file with new parent
            newImports.push(im);

            //finally add to global imports list
            imports = newImports;

        }

        //If any imported file is in the parents list of other imported file remove that as well
        removeParentFromAllImports(_id(importedPath));


        //Remove any file that is in files list and is imported by this file
        removeFile(_id(importedPath));

    }



    //Function to add files
    function addFiles(list, projectPath) {

        _.each(list, function (filePath) {

            //Check if file already exists in files list
            var already = _.isEmpty(_.findWhere(files, {input: filePath})) ? false : true;

            var inImports = _.isEmpty(_.findWhere(imports, {path: filePath})) ? false : true;

            if (!already && !inImports) {

                var file,
                    extension = path.extname(filePath).toLowerCase();

                //File that can have @imports or includes
                //Ignore sass partials
                var sass = ['.sass', '.scss'];

                var partial = /^_/;

                var canImport = _.contains(['.less', '.scss', '.sass', '.styl', '.jade'], extension);

                var isSassPartial = _.contains(sass, extension) && partial.exec(path.basename(filePath));

                if (canImport && !isSassPartial) {

                    if (extension === '.less') {

                        file = fileTypes.less.format(filePath, projectPath);

                    } else if (extension === '.sass' || extension === '.scss') {

                        file = fileTypes.sass.format(filePath, projectPath);

                    } else if (extension === '.styl') {

                        file = fileTypes.stylus.format(filePath, projectPath);

                    } else if (extension === '.jade') {

                        file = fileTypes.jade.format(filePath, projectPath);

                    }
                } else if (extension === '.md' || extension === '.markdown') {

                    file = fileTypes.markdown.format(filePath, projectPath);

                } else if (extension === '.coffee') {

                    file = fileTypes.coffee.format(filePath, projectPath);

                } else if (extension === '.haml') {

                    file = fileTypes.haml.format(filePath, projectPath);

                } else if (extension === '.slim') {

                    file = fileTypes.slim.format(filePath, projectPath);

                }

                //There is new file
                if (!_.isEmpty(file)) {

                    files.push(file);

                }
            }
        });

        //Broadcast data change event
        $rootScope.$broadcast('dataChange', {projects: projects, files: files, imports: imports});

    }

    //Function to change file output path
    function changeFileOutput(id, newPath){

        var file = getFileById(id),
            project = getProjectById(file.pid);

        var css = ['scss', 'sass', 'stylus', 'less'];
        var js = ['coffee'];
        var html = ['jade', 'haml', 'md', 'slim'];

        var type = file.type.toLowerCase();

        if(path.extname(path.basename(newPath)) === ''){

            if(_.contains(css, type)){

                newPath = newPath + '.css';

            } else if(_.contains(html, type)) {

                newPath = newPath + config.getUserOptions().htmlExtension;

            } else if(_.contains(js, type)){

                newPath = newPath + '.js';

            }
        }

        file.output = newPath;

        file.shortOutput = newPath.replace(/\\/g, '/');

        //Show Relative path if output file is within project folder
        if (path.relative(project.path, newPath).indexOf('.' + path.sep) === -1) {

            file.shortOutput = path.relative(project.path, newPath).replace(/\\/g, '/');
        }

        $rootScope.$broadcast('dataChange', {projects: projects, files: files, imports: imports});
    }

    //Return
    return {
        projects: projects,
        files: files,
        imports: imports,

        getProjectById: getProjectById,
        getFileById: getFileById,
        getImportById: getImportById,

        addProject: addProject,
        addFiles: addFiles,

        removeFile: removeFile,
        removeProject: removeProject,
        removeImport: removeImport,

        refreshProjectFiles: refreshProjectFiles,
        getProjectFiles: getProjectFiles,
        changeFileOutput: changeFileOutput
    };
});
