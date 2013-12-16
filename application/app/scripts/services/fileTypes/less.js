/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */


/*jshint browser: true, node: true, curly: false*/
/*global prepros*/

prepros.factory('less', [

    '$filter',

    function ($filter) {

        'use strict';

        var less = require('less');
        var path = require('path');
        var autoprefixer = require('autoprefixer');
        var fs = require('fs-extra');
        var CleanCss = require('clean-css');

        var compile = function (file, project, callback) {

            var input = path.resolve(project.path, file.input);

            var output = (file.customOutput) ? path.resolve(project.path, file.customOutput) : $filter('interpolatePath')(file.input, project);

            var options = {
                compress: file.config.compress,
                cleancss: file.config.cleancss && !file.config.sourcemaps, //Do not run if sourcemaps are enabled
                sourceMap: file.config.sourcemaps,
                sourceMapFilename: path.basename(output) + '.map',
                sourceMapRootpath: '',
                writeSourceMap: function (map) {

                    try {

                        //Small fix to make sourcemaps relative
                        var data = JSON.parse(map);

                        for (var i = 0; i < data.sources.length; i++) {

                            if (input.substr(0, 1) === data.sources[i].substr(0, 1)) {

                                data.sources[i] = path.relative(path.dirname(output), data.sources[i]).replace(/\\/g, '/');

                            }
                        }

                        fs.outputFile(output + '.map', JSON.stringify(data), function (err) {

                            if (err) callback(err);

                        });

                    } catch (e) {
                    }
                }

            };

            var parser = new (less.Parser)({
                paths: [path.dirname(input)],
                filename: input
            });


            fs.readFile(input, 'utf8', function (err, data) {

                if (err) return callback(new Error('Unable to read source file\n' + err.message));

                parser.parse(data, function (err, tree) {

                    if (err) return callback(new Error(err.message + "\n" + err.filename + ' line ' + err.line));

                    try {

                        var css = tree.toCSS(options); //Fuck you, can't you just gimme callback from parser

                    } catch (err) {

                        return callback(new Error(err.message + "\n" + err.filename + ' line ' + err.line));
                    }


                    if (!file.config.sourcemaps && file.config.autoprefixer) {

                        try {

                            if (project.config.autoprefixerBrowsers) {

                                var autoprefixerOptions = project.config.autoprefixerBrowsers.split(',').map(function (i) {
                                    return i.trim();
                                });

                                css = autoprefixer.apply(null, autoprefixerOptions).compile(css);

                            } else {

                                css = autoprefixer().compile(css);
                            }

                            if (file.config.compress || file.config.cleancss) {

                                css = new CleanCss({processImport: false}).minify(css);
                            }

                        } catch (err) {

                            return callback(new Error('Failed to autoprefix css' + err.message));

                        }
                    }

                    fs.outputFile(output, css, function (err) {

                        if (err) return callback(new Error('Unable to write compiled data. ' + err.message));

                        callback(null, input);

                    });

                });
            });
        };

        return {
            compile: compile
        };

    }
]);
