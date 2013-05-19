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

    //Function to get project by its's id
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
            var im = _.filter(imports, function (imp) {

                return _.contains(imp.parents, id);

            });

            if (!_.isEmpty(im)) {

                _.each(im, function (imp) {

                    var newImports = _.reject(imports, function (imported) {
                        return imported.path === imp.path;
                    });

                    imp.parents = _.without(im.parents, id);

                    //If after removing one file as parent the parents list becomes empty remove whole import item
                    if (!_.isEmpty(imp.parents)) {

                        newImports.push(imp);

                    }

                    imports = newImports;

                });

            }

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

    //Function that walks and returns all files in a folder
    function refreshProjectFiles(pid) {

        //Remove all previous project files
        var folder = getProjectById(pid).path;

        //Remove file if it doesn't exist
        _.each(getProjectFiles(pid), function(file){
            if(!fs.existsSync(file.input)){
                removeFile(file.id);
            }
        });

        var filesToAdd = [];

        utils.showLoading();

        if(fs.existsSync(folder)){
            //Get all files in project folder and add file to file list
            walker(folder, function (err, file, next) {

                    //Ouch error occurred
                    if (err) {

                        notification.error('Error getting all files. ', folder);
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
                            '.haml'  //Haml
                        ];
                        if (_.contains(supportedExtensions, extname)) {

                            filesToAdd.push(path.normalize(file));

                        }

                    }

                    //Next file
                    if (next) {
                        next();
                    } else {

                        //Add files
                        if (!_.isEmpty(filesToAdd)) {

                            addFileImports(filesToAdd, folder);
                            addFiles(filesToAdd, folder);

                        }

                        utils.hideLoading();
                    }
                }
            );
        } else {

            removeProject(pid);

            utils.hideLoading();

        }

    }

    //function to add all imports by file to imports list
    //it also removes files from files-list that are also in imports list
    function addFileImports(list, projectPath) {

        _.each(list, function (filePath) {

            var extension = path.extname(filePath).toLowerCase();

            //Ignore sass partials
            var sass = ['.sass', '.scss'];

            var partial = /^_/;

            var canImport = _.contains(['.less', '.scss', '.sass', '.styl', '.jade'], extension);

            var isSassPartial = _.contains(sass, extension) && partial.exec(path.basename(filePath));

            //Check if file is in imports list
            var inImports = _.isEmpty(_.findWhere(imports, {path: filePath})) ? false : true;

            if (canImport && !isSassPartial && !inImports) {

                //Get all the files @import-ed by this file
                var importsByThisFile = importsVisitor.visitImports(filePath);

                _.each(importsByThisFile, function (importedFile) {

                    //If @imported file is not in imports list create new entry otherwise add this file as parent
                    if (_.isEmpty(_.findWhere(imports, {path: importedFile}))) {

                        imports.push({
                            id: _id(importedFile),
                            pid: _id(projectPath),
                            path: importedFile,
                            parents: [_id(filePath)]
                        });

                    } else {

                        var im = _.findWhere(imports, {path: importedFile});

                        if (!_.contains(im.parents, _id(filePath))) {
                            im.parents.push(_id(filePath));
                        }

                        var newImports = _.reject(imports, function (imp) {
                            return imp.path === importedFile;
                        });

                        newImports.push(im);

                        imports = newImports;

                    }

                    //Remove any file that is in files list and is imported by this file
                    removeFile(_id(importedFile));

                });

                //If any previously @imported file is not imported anymore
                _.each(imports, function(im){

                    if(_.contains(im.parents, _id(filePath))){

                        var oldImports = _.filter(imports, function(){
                            return _.contains(im.parents, _id(filePath));
                        });

                        _.each(oldImports, function(oldImport){

                            if(!_.contains(importsByThisFile, oldImport.path)){

                                var modifiedImports = _.reject(imports, function (imported) {
                                    return imported.path === oldImport.path;
                                });

                                //Change the parents
                                oldImport.parents = _.without(oldImport.parents, _id(filePath));

                                //If the parents list is empty remove whole import else add
                                if (!_.isEmpty(oldImport.parents)) {

                                    modifiedImports.push(oldImport);
                                }

                                imports = modifiedImports;
                            }
                        });

                    }

                });
            }
        });
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
        var html = ['jade', 'haml', 'md'];

        var type = file.type.toLowerCase();

        if(path.extname(path.basename(newPath)) === ''){

            if(_.contains(css, type)){

                newPath = newPath + '.css';

            } else if(_.contains(html, type)) {

                newPath = newPath + config.user.htmlExtension;

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
