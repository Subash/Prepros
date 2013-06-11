/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, loopfunc: true*/
/*global prepros, _*/

prepros.factory('javascript', function (config, utils, importsVisitor) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        _id = utils.id;


    var format = function (filePath, projectPath) {

        //File name
        var name = path.basename(filePath);

        //Relative input path
        var shortInput = path.relative(projectPath, filePath).replace(/\\/g, '/');

        // Output path
        var output = path.join(path.dirname(filePath), 'min', path.basename(filePath).replace(/\.js/gi, '.min.js'));

        //Find short output path
        var shortOutput = output.replace(/\\/g, '/');

        //Show Relative path if output file is within project folder
        if (path.relative(projectPath, filePath).indexOf('.' + path.sep) === -1) {

            shortOutput = path.relative(projectPath, output).replace(/\\/g, '/');
        }

        return {

            id: _id(filePath),
            pid: _id(projectPath),
            name: name,
            type: 'JS',
            input: filePath,
            shortInput: shortInput,
            output: output,
            shortOutput: shortOutput,
            config: config.getUserOptions().javascript
        };
    };

    var compile = function (file, callback) {

        var ugly = require('uglify-js');

        var options = {};

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {
            if (err) {

                callback(true, err.message);

            } else {

                var javascript = data.toString();

                if (file.config.uglify) {

                    try {

                        javascript = ugly.minify(javascript, {fromString: true}).code;

                    } catch(e) {

                        error = true;

                        callback(true, 'Error on line '+ e.line + ' col ' + e.col + ' '+ e.message + ' of '+ file.input);
                    }
                }

                var result, importedFile, error = false, fileImports = [];

                var importReg = /\/\/(?:\s|)@prepros-append\s+(.*)/gi;

                var read = function(filePathToRead) {

                    var impFiles = [];

                    while ((result = importReg.exec(fs.readFileSync(filePathToRead))) !== null) {

                        result[1] = result[1].replace(/'|"/gi, '').trim();

                        //Check if path is full or just relative
                        if (result[1].indexOf(':') >= 0) {

                            importedFile = path.normalize(result[1]);

                        } else {

                            importedFile = path.join(path.dirname(filePathToRead), result[1]);
                        }

                        //Add extension
                        if (path.extname(importedFile).toLowerCase() !== '.js') {

                            importedFile = importedFile + '.js';
                        }

                        //Check if file exists
                        if (fs.existsSync(importedFile)) {

                            impFiles.push(importedFile);

                        } else {

                            error = true;

                            callback(true, 'Imported file "'+ importedFile +'" not found \n' + file.input);
                        }
                    }

                    return impFiles;
                };

                fileImports[0] = read(file.input);

                //Get imports of imports up to four levels
                for(var i=1; i<5; i++) {

                    fileImports[i] = [];

                    _.each(fileImports[i-1], function(importedFile){

                        fileImports[i] = _.uniq(_.union(fileImports[i], read(importedFile)));

                    });
                }

                try {

                    //Remove repeated imports
                    _.each(_.uniq(_.flatten(fileImports)), function(imp) {

                        var js = fs.readFileSync(imp).toString();

                        if (file.config.uglify && !/min.js$/.exec(path.basename(imp))) {

                            try {

                                js = ugly.minify(js, {fromString: true}).code;

                            } catch(e) {

                                error = true;

                                callback(true, 'Error on line '+ e.line + ' col ' + e.col + ' '+ e.message + ' of '+ imp);
                            }
                        }

                        javascript = javascript + '\n'  + js;
                    });

                } catch(e) {

                    error = true;

                    callback(true, e.message);

                }


                if(!error) {

                    //Remove @prepros-append statements
                    javascript = javascript.replace(importReg, '');

                    fs.outputFile(file.output, javascript, function (err) {

                        if (err) {

                            callback(true, err.message);

                        } else {

                            callback(false, file.input);
                        }
                    });
                }
            }
        });
    };

    return {
        format: format,
        compile: compile
    };
});