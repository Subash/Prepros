/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, loopfunc: true*/
/*global prepros, _*/

prepros.factory('coffee', function (config, utils) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        _id = utils.id;


    var format = function (pid, fid, filePath, projectPath) {

        //File name
        var name = path.basename(filePath);

        // Output path
        var output = filePath.replace(/\.coffee/gi, '.js');

        var pathRegx = /\\coffee\\|\/coffee\//gi;

        //Find output path; save to /js folder if file is in /coffee folder
        if (filePath.match(pathRegx)) {

            var customOutput = path.normalize(output.replace(pathRegx, path.sep + '{{jsPath}}' + path.sep));

            if(utils.isFileInsideFolder(projectPath, customOutput)) {
                output = customOutput;
            }

        }

        return {

            id: fid,
            pid: pid,
            name: name,
            type: 'Coffee',
            input: path.relative(projectPath, filePath),
            output: path.relative(projectPath, output),
            config: config.getUserOptions().coffee
        };
    };

    var compile = function (file, successCall, errorCall) {

        var coffee = require('coffee-script');

        var ugly = require('uglify-js');

        var options = {};

        if (file.config.bare) {

            options.bare = true;
        }

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {
            if (err) {

                errorCall(err.message);

            } else {

                var run = function () {

                    var javascript = data.toString();

                    try {

                        javascript = coffee.compile(data.toString(), options);

                    } catch(e) {

                        throw {message: 'Error on line ' + e.location.first_line + ' of ' + file.input};
                    }

                    if (file.config.uglify) {

                        try {

                            javascript = ugly.minify(javascript, {fromString: true, mangle: file.config.mangle}).code;

                        } catch (e) {

                            throw {message: 'Error on' + file.input};
                        }
                    }

                    var importReg = {
                        append: /\#(?:\s|)@(?:prepros|codekit)-append\s+(.*)/gi,
                        prepend: /\#(?:\s|)@(?:prepros|codekit)-prepend\s+(.*)/gi
                    };

                    var read = function (filePathToRead) {

                        var data = fs.readFileSync(filePathToRead).toString();

                        var importedFiles = {
                            append: [],
                            prepend: []
                        };

                        var regs = Object.keys(importReg);

                        _.each(regs, function (reg) {

                            var result;

                            do {

                                result = importReg[reg].exec(data);

                                if(result) {

                                    var impFile = result[1].replace(/'|"/gi, '').trim();

                                    //Check if path is full or just relative
                                    if (impFile.indexOf(':') >= 0) {

                                        impFile = path.normalize(impFile);

                                    } else {

                                        impFile = path.join(path.dirname(filePathToRead), impFile);
                                    }

                                    //Underscore files
                                    var _imp = path.dirname(impFile) + path.sep + '_' + path.basename(impFile);

                                    //Check if file exists
                                    if (fs.existsSync(_imp) && fs.statSync(_imp).isFile()) {

                                        importedFiles[reg].push(_imp);

                                    } else if(fs.existsSync(impFile) && fs.statSync(impFile).isFile()) {

                                        importedFiles[reg].push(impFile);

                                    } else {


                                        throw {message: 'Imported file "' + impFile + '" not found \n Imported by "' + file.input + '"'};
                                    }
                                }

                            } while (result);
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

                            if(/\.coffee/.test(imp)) {

                                try {

                                    js = coffee.compile(js, options);

                                } catch (e) {

                                    throw {message: 'Error on line ' + (parseInt(e.location.first_line, 10) + 1) + ' of ' + imp};

                                }
                            }

                            if (file.config.uglify && !/min.js$/.exec(path.basename(imp))) {

                                try {

                                    js = ugly.minify(js, {fromString: true, mangle: file.config.mangle}).code;

                                } catch (e) {

                                    throw {message: 'Error on line ' + e.line + ' col ' + e.col + ' ' + e.message + ' of ' + imp};
                                }
                            }

                            if (append) {

                                javascript = javascript + '\n' + js;

                            } else {

                                javascript = js + '\n' + javascript;

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