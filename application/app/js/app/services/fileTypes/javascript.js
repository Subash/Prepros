/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, loopfunc: true*/
/*global prepros, _*/

prepros.factory('javascript', function (config, utils) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        _id = utils.id;


    var format = function (filePath, projectPath) {

        //File name
        var name = path.basename(filePath);

        //Relative input path
        var shortInput = path.relative(projectPath, filePath);

        // Output path
        var output = path.join(path.dirname(filePath), '{{jsMinPath}}', path.basename(filePath).replace(/\.js/gi, '.min.js'));

        return {

            id: _id(filePath),
            pid: _id(projectPath),
            name: name,
            type: 'JS',
            input: filePath,
            shortInput: shortInput,
            output: output,
            config: config.getUserOptions().javascript
        };
    };

    var compile = function (file, successCall, errorCall) {

        var ugly = require('uglify-js');

        var options = {};

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {

            if (err) {

                errorCall(err.message);

            } else {

                var run = function () {

                    var javascript = data.toString();

                    if (file.config.uglify) {

                        try {

                            javascript = ugly.minify(javascript, {fromString: true, mangle: file.config.mangle}).code;

                        } catch (e) {

                            throw {message: 'Error on line ' + e.line + ' col ' + e.col + ' ' + e.message + ' of ' + file.input};
                        }
                    }

                    var importReg = {
                        append: /\/\/(?:\s|)@(?:prepros|codekit)-append\s+(.*)/gi,
                        prepend: /\/\/(?:\s|)@(?:prepros|codekit)-prepend\s+(.*)/gi
                    };

                    var read = function (filePathToRead) {

                        var importedFiles = {
                            append: [],
                            prepend: []
                        };

                        var regs = Object.keys(importReg);

                        _.each(regs, function (reg) {

                            var result;

                            while ((result = importReg[reg].exec(fs.readFileSync(filePathToRead))) !== null) {

                                var importedFile;

                                result[1] = result[1].replace(/'|"/gi, '').trim();

                                //Check if path is full or just relative
                                if (result[1].indexOf(':') >= 0) {

                                    importedFile = path.normalize(result[1]);

                                } else {

                                    importedFile = path.join(path.dirname(filePathToRead), result[1]);
                                }

                                //Check if file exists
                                if (fs.existsSync(importedFile)) {

                                    importedFiles[reg].push(importedFile);

                                } else {

                                    throw {message: 'Imported file "' + importedFile + '" not found \n Imported by "' + file.input + '"'};
                                }
                            }
                        });

                        return {
                            append: importedFiles.append,
                            prepend: importedFiles.prepend.reverse()
                        };
                    };

                    var get = function (append) {

                        var imps = [];
                        imps[0] = (append) ? read(file.input).append : read(file.input).prepend;

                        //Get imports of imports up to four levels
                        for (var i = 1; i < 5; i++) {

                            imps[i] = [];

                            _.each(imps[i - 1], function (importedFile) {

                                imps[i] = _.uniq(_.union(imps[i], (append) ? read(importedFile).append : read(importedFile).prepend));
                            });
                        }

                        return _.uniq(_.flatten(imps));

                    };

                    var join = function (files, append) {

                        //Remove repeated imports
                        _.each(_.uniq(_.flatten(files)), function (imp) {

                            var js = fs.readFileSync(imp).toString();

                            if (file.config.uglify && !/min.js$/.exec(path.basename(imp))) {

                                try {

                                    js = ugly.minify(js, {fromString: true, mangle: file.config.mangle}).code;

                                } catch (e) {

                                    throw {message: 'Error on line ' + e.line + ' col ' + e.col + ' ' + e.message + ' of ' + imp};
                                }
                            }

                            if (append) {

                                javascript = javascript + js;

                            } else {

                                javascript = js + javascript;

                            }
                        });
                    };

                    //Join Files
                    var appends = get(true);
                    var prepends = get(false);
                    join(appends, true);
                    join(prepends, false);

                    _.each(importReg, function (reg) {

                        javascript = javascript.replace(new RegExp(reg.source + '\n', 'gi'), '');
                    });

                    try {
                        fs.outputFileSync(file.output, javascript);
                    } catch (e) {
                        throw e;
                    }
                };


                //try to compile js
                try {

                    run();

                    successCall(file.input);

                } catch (e) {
                    errorCall(e.message);
                }
            }
        });
    };

    return {
        format: format,
        compile: compile
    };
});