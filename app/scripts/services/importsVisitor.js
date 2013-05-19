/*jshint browser: true, node: true*/
/*global prepros*/

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

        //Strip out comments
        data = data.replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '');

        if (ext === '.less') {

            importReg = /@import[\s\("']*([^"'\);\n]+)[;\)"']*/g;

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

        } else if (ext === '.styl') {

            importReg = /@import\s["']*([^"';\n]+)[;"']*/g;

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

        } else if (ext === '.jade') {

            importReg = /include\s([^\n\s]+)*/g;

            while ((result = importReg.exec(data)) !== null) {

                var fPath = result[1].trim();

                //Check if path is full or just relative
                if (fPath.indexOf(':') >= 0) {
                    importedFilePath = path.normalize(fPath);
                } else {
                    importedFilePath = path.join(basedir, fPath);
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

        } else if (ext === '.sass' || ext === '.scss') {

            importReg = /@import[ \("']*([^;]+)[;\)"']*/g;

            var i;

            while ((result = importReg.exec(data)) !== null) {


                var res = result[1].replace(/"|'/gi, '').split(',');

                for (i = 0; i < res.length; i++) {

                    var imp = res[i].trim();

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
                }

            }

        }

        return importedFiles;
    }


    return {
        visitImports: visitImports
    };

});