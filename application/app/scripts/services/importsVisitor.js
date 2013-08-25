/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, loopfunc: true*/
/*global prepros, _*/

//Imports Visitor
prepros.factory('importsVisitor', function (utils) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path');


    function visitImports(filePath, projectPath) {

        var can = ['less', 'sass', 'scss', 'jade', 'styl', 'slim', 'js', 'coffee'];

        if(!_.contains(can, path.extname(filePath).slice(1))) {

            return [];
        }

        var importedFiles = [];
        var ext = path.extname(filePath).toLowerCase();
        var data = fs.readFileSync(filePath).toString();
        var result;
        var basedir = path.dirname(filePath);
        var importReg;

        //Strip Comments
        if (ext !== '.js') {
            data = data.replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '');
            data = data.replace(/\/\/.*/g, '');
        }


        if (ext === '.less') {
            importReg = /@import\s+[url\('"]*(.*)["'\)]/g;
        }
        if (ext === '.scss') {
            importReg = /@import\s['"]*([^;]+)[;"']/g;
        }
        if (ext === '.sass') {
            importReg = /@import\s+(.*)/g;
        }
        if (ext === '.styl') {
            importReg = /@import\s["'\(]*([^"';\n\)]+)[;\)"']/g;
        }
        if (ext === '.jade') {
            importReg = /(?:include|extends)\s+(.*)/g;
        }
        if (ext === '.slim') {
            importReg = /\==\sSlim::Template.new\(['"]*([^\n"']+)['"]\).render/g;
        }
        if (ext === '.js') {
            importReg = /\/\/(?:\s|)@(?:prepros|codekit)-(?:append|prepend)\s+(.*)/gi;
        }
        if (ext === '.coffee') {
            importReg = /#(?:\s|)@(?:prepros|codekit)-(?:append|prepend)\s+(.*)/gi;
        }

        //Automatically add extension for certail files
        var autoExt = ['.less', '.styl', '.jade'];

        do {
            result = importReg.exec(data);

            if (result) {

                var file = result[1].replace(/"|'|\n/gi, '').trim();

                if(file.indexOf(',')>=0) {

                    file = file.split(',').map(function(f) {

                        f = f.trim();

                        if (f.indexOf(":") >= 0) {
                            f = path.normalize(f);
                        } else {
                            f = path.join(basedir, f);
                        }

                        return f;
                    });
                }

                if(_.isArray(file) ) {

                    _.each(file, function (imp) {

                        //Add extension if file doesn't have that
                        if (path.extname(imp).toLowerCase() !== ext) {
                            imp = imp + ext;
                        }

                        //First check for partial file
                        var _imp = path.dirname(imp) + path.sep + '_' + path.basename(imp);

                        if (fs.existsSync(_imp) && utils.isFileInsideFolder(projectPath, _imp)) {

                            importedFiles.push(_imp);

                        } else if (fs.existsSync(imp) && utils.isFileInsideFolder(projectPath, imp)) {

                            importedFiles.push(imp);

                        }
                    });
                } else {

                    //Check if path is full or just relative
                    if (file.indexOf(':') >= 0) {
                        file = path.normalize(file);
                    } else {
                        file = path.join(basedir, file);
                    }

                    //Test if file without adding extension exists
                    if (fs.existsSync(file) && utils.isFileInsideFolder(projectPath, file)) {

                        importedFiles.push(file);

                    } else {

                        if (path.extname(file).toLowerCase() !== ext && _.contains(autoExt, ext)) {
                            file = file + ext;
                        }

                        if (fs.existsSync(file) && utils.isFileInsideFolder(projectPath, file)) {

                            importedFiles.push(file);
                        }
                    }
                }
            }
        } while (result);

        return importedFiles;
    }


    //Function to visit imports with nested support
    function getImports(filePath, projectPath) {

        var fileImports = [];

        fileImports[0] = visitImports(filePath, projectPath);

        //Get imports of imports up to four levels
        for (var i = 1; i < 5; i++) {

            fileImports[i] = [];

            _.each(fileImports[i - 1], function (importedFile) {

                fileImports[i] = _.uniq(_.union(fileImports[i], visitImports(importedFile, projectPath)));

            });
        }

        //Remove repeated imports
        return _.uniq(_.flatten(fileImports));

    }


    return {
        getImports: getImports
    };

});