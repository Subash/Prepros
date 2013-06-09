/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, loopfunc: true*/
/*global prepros, _*/

//Imports Visitor
prepros.factory('importsVisitor', function () {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path');

    //Function to get files list imported by another file; returns the list of imported files that exist
    function visitImports(filePath) {

        var importedFiles = [],
            ext = path.extname(filePath).toLowerCase(),
            data = fs.readFileSync(filePath).toString(),
            result,
            basedir = path.dirname(filePath),
            importedFilePath,
            importReg;

        //Strip Comments
        data = data.replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '');
        data = data.replace(/\/\/.*/g, '');

        if (ext === '.less') { importReg = /@import\s['"]*([^\n;"']+)[;"']/g; }
        if (ext === '.scss') { importReg = /@import\s['"]*([^;]+)[;"']/g; }
        if (ext === '.sass') { importReg = /@import\s['"]*([^;\n]+)["']/g; }
        if (ext === '.styl') { importReg = /@import\s["'\(]*([^"';\n\)]+)[;\)"']/g; }
        if (ext === '.jade') { importReg = /include\s+(.*)/g; }
        if (ext === '.slim') { importReg = /\==\sSlim::Template.new\(['"]*([^\n"']+)['"]\).render/g; }


        if(ext !== '.sass' && ext !== '.scss'){

            while ((result = importReg.exec(data)) !== null) {

                //Check if path is full or just relative
                if (result[1].indexOf(':') >= 0) {
                    importedFilePath = path.normalize(result[1]);
                } else {
                    importedFilePath = path.join(basedir, result[1]);
                }

                //Add extension if file doesn't have that
                if (path.extname(importedFilePath).toLowerCase() !== ext) {
                    importedFilePath = importedFilePath + ext;
                }

                //Check if file exists
                if (fs.existsSync(importedFilePath)) {

                    importedFiles.push(importedFilePath);
                }
            }

        } else {

            //Read imports
            while ((result = importReg.exec(data)) !== null) {

                var res = result[1].replace(/"|'/gi, '').split(',');

                _.each(res, function(imp){

                    imp = imp.trim();

                    if (imp && imp.indexOf(":") >= 0) {
                        importedFilePath = path.normalize(imp);
                    } else {
                        importedFilePath = path.join(basedir, imp);
                    }

                    //Add extension if file doesn't have that
                    if (path.extname(importedFilePath).toLowerCase() !== ext) {
                        importedFilePath = importedFilePath + ext;
                    }

                    //First check for partial file
                    var importedWithPartial = path.normalize(path.dirname(importedFilePath) + path.sep + '_' + path.basename(importedFilePath));

                    //Check if file exists
                    if (fs.existsSync(importedWithPartial)) {

                        importedFiles.push(importedWithPartial);

                    } else if (fs.existsSync(importedFilePath)) {

                        importedFiles.push(importedFilePath);

                    }
                });
            }
        }

        return importedFiles;
    }


    //Function to visit imports with nested support
    function getImports(filePath) {

        var fileImports = [];

        fileImports[0] = visitImports(filePath);

        //Get imports of imports up to four levels
        for(var i=1; i<5; i++) {

            fileImports[i] = [];

            _.each(fileImports[i-1], function(importedFile){

                fileImports[i] = _.uniq(_.union(fileImports[i], visitImports(importedFile)));

            });
        }

        //Remove repeated imports
        return _.uniq(_.flatten(fileImports));

    }


    return {
        getImports: getImports
    };

});