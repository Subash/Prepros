/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, loopfunc: true, curly: false*/
/*global prepros, _*/

prepros.factory('coffee', [

    '$filter',
    'concat',

    function ($filter, concat) {

        'use strict';

        var path = require('path');
        var fs = require('fs-extra');
        var ugly = require('uglify-js');

        var appendRegx = /#(?:\s|)@(?:\s|)(?:prepros|codekit)-append\s+(.*)/gi;
        var prependRegx = /#(?:\s|)@(?:\s|)(?:prepros|codekit)-prepend\s+(.*)/gi;

        var compile = function(file, project, callback) {

            var input = path.resolve(project.path, file.input);

            var output = (file.customOutput)? path.resolve(project.path, file.customOutput): $filter('interpolatePath')(file.input, project);

            var coffee = (file.config.iced)? require('iced-coffee-script'): require('coffee-script');

            concat.getConcatList(input, {

                appendRegx : appendRegx,
                prependRegx : prependRegx

            }, function(err, list) {

                if(err) return callback(new Error('Unable read the concatenation list \n' + err.message) );

                if(list.length > 1) {

                    var total = list.length;

                    var dataArray = [];

                    //Make slots for data
                    dataArray.length = list.length;

                    var _complete = function() {

                        if(!total) {

                            fs.outputFile(output, dataArray.join("\n"), function(err) {

                                if(err) return callback(new Error('Unable to write output file ' + err.message));

                                callback(null, input);
                            });
                        }
                    };

                    _.each(list, function(filePath, i) {

                        fs.readFile(filePath, 'utf8', function(err, js) {

                            if(err) return callback(new Error('Failed to read file \n' + err.message));

                            js = js.split("\n").map(function(line) {

                                if(!line.match(appendRegx) && !line.match(prependRegx)) return line;

                            });

                            js = js.join("\n");

                            var options = {
                                bare: file.config.bare,
                                input: js
                            };

                            try {

                                js = coffee.compile(js, options);

                            } catch (e) {

                                return callback(new Error('Error on line ' + (parseInt(e.location.first_line, 10) + 1) + ' of ' + input));

                            }

                            if (file.config.uglify) {

                                try {

                                    js = ugly.minify(js, {fromString: true, mangle: file.config.mangle}).code;

                                } catch (e) {

                                    return callback(new Error('Unable to uglify \n ' + e.message + ' \n ' + filePath));
                                }
                            }

                            --total;

                            dataArray[i] = js;

                            _complete();
                        });

                    });

                    return;
                }

                //If concatination is not used proceed to sourcemaps and single file compilation
                fs.readFile(input, 'utf8', function(err, data) {

                    if(err) return callback(new Error('Unable to read source file\n' + err.message));


                    var options = {
                        bare: file.config.bare,
                        input: data
                    };

                    var js;

                    if(file.config.sourcemaps) {

                        var sourceFiles;

                        if(input.substr(0, 1) === output.substr(0, 1)) {

                            sourceFiles = path.relative(path.dirname(output), input).replace(/\\/g, '/');

                        } else {

                            sourceFiles = input;

                        }

                        options.sourceMap = true;
                        options.sourceFiles= [sourceFiles];

                        var compiled;

                        var outmapName = output + '.map';

                        try {

                            compiled = coffee.compile(data, options);

                            js = compiled.js;

                            js += '\n //# sourceMappingURL=' + path.basename(outmapName);

                        } catch (e) {

                            return callback(new Error('Error on line ' + (parseInt(e.location.first_line, 10) + 1) + ' of ' + input));

                        }

                        fs.outputFile(outmapName, compiled.v3SourceMap, function(err) {

                            if(err) return callback(new Error('Unable to write sourcemap ' + err.message));

                            if (file.config.uglify) {

                                try {

                                    var compiled = ugly.minify(js, {
                                        fromString: true,
                                        inSourceMap: outmapName,
                                        outSourceMap: path.basename(outmapName),
                                        mangle: file.config.mangle
                                    });

                                    js = compiled.code;

                                    js += '\n //# sourceMappingURL=' + path.basename(outmapName);

                                    fs.outputFile(outmapName, compiled.map, function(err) {
                                        if(err) callback(new Error('Unable to write sourcemap ' + err.message));
                                    });

                                } catch (e) {

                                    return callback(new Error('Error on line ' + e.line + ' col ' + e.col + ' ' + e.message + ' of ' + input));
                                }
                            }

                            fs.outputFile(output, js, function(err) {

                                if(err) return callback(new Error('Unable to write output file ' + err.message));

                                callback(null, input);
                            });

                        });

                    } else {

                        try {

                            js = coffee.compile(data, options);

                        } catch (e) {

                            return callback(new Error('Error on line ' + (parseInt(e.location.first_line, 10) + 1) + ' of ' + input));

                        }

                        if (file.config.uglify) {

                            try {

                                js = ugly.minify(js, {fromString: true, mangle: file.config.mangle}).code;

                            } catch (e) {

                                return callback(new Error('Unable to uglify \n' + e.message + '\n' + input));
                            }
                        }

                        fs.outputFile(output, js, function(err) {

                            if(err) return callback(new Error('Unable to write output file ' + err.message));

                            callback(null, input);
                        });
                    }

                });
            });
        };

        return {
            compile: compile
        };
    }
]);