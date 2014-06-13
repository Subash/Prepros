/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */


/*jshint browser: true, node: true, curly: false*/
/*global prepros*/

prepros.factory('stylus', [

    '$filter',

    function ($filter) {

        'use strict';

        var path = require('path');
        var autoprefixer = require('autoprefixer');
        var fs = require('fs-extra');
        var CleanCss = require('clean-css');
        var stylus = require('stylus');
        var nib = require('nib');

        var compile = function (file, project, callback) {

            var input = path.resolve(project.path, file.input);

            var output = (file.customOutput) ? path.resolve(project.path, file.customOutput) : $filter('interpolatePath')(file.input, project);

            fs.readFile(input, 'utf8', function (err, data) {

                if (err) return callback(new Error('Unable to read source file\n' + err.message));

                var importPath = path.dirname(input);

                var compiler = stylus(data).set('filename', file.input).include(importPath);

                //Stylus nib plugin
                if (file.config.nib) compiler.use(nib());

                //Compress
                compiler.set('compress', file.config.compress);

                //Line numbers
                compiler.set('linenos', file.config.lineNumbers);

                //Render
                compiler.render(function (err, css) {

                    if (err) return callback(new Error(err.message));

                    if (file.config.autoprefixer) {

                        try {

                            if (project.config.autoprefixerBrowsers) {

                                var autoprefixerOptions = project.config.autoprefixerBrowsers.split(',').map(function (i) {
                                    return i.trim();
                                });

                                css = autoprefixer(autoprefixerOptions).process(css);

                            } else {

                                css = autoprefixer().process(css);
                            }

                            if (file.config.compress) {

                                css = new CleanCss({processImport: false}).minify(css);
                            }

                        } catch (err) {

                            callback(new Error('Failed to autoprefix css' + err.message));

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