/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */


/*jshint browser: true, node: true, curly: false*/
/*global prepros*/

prepros.factory('sass', [

    'config',
    '$filter',

    function (config, $filter) {

        'use strict';

        var fs = require('fs-extra');
        var path = require('path');
        var cp = require('child_process');
        var autoprefixer = require('autoprefixer');
        var CleanCss = require('clean-css');

        var compile = function (file, project, callback) {

            var input = path.resolve(project.path, file.input);

            var output = (file.customOutput) ? path.resolve(project.path, file.customOutput) : $filter('interpolatePath')(file.input, project);

            var args = [];

            if (file.config.compass && file.config.fullCompass) {

                args = config.ruby.getGem('compass');

                //Compass requires relative file path
                args.push('compile', path.relative(project.path, input).replace(/\\/gi, '/'));

                //No colors
                args.push('--boring');

            } else {

                args = config.ruby.getGem('sass');

                if (file.config.unixNewlines) {

                    args.push('--unix-newlines');
                }

                //Output and input must be in same drive for sourcemaps to work
                if (project.path.substr(0, 1) === output.substr(0, 1)) {

                    //Input and output
                    args.push(path.basename(input), path.relative(path.dirname(input), output));

                } else {

                    args.push(input, output);
                }

                //Load path for @imports
                args.push('--load-path', path.dirname(input));

                //Convert backslashes to double backslashes which weirdly escapes single quotes from sass cache path fix #52
                var cacheLocation = config.cachePath.replace(/\\\\/gi, '\\\\');

                //Cache location
                args.push('--cache-location', cacheLocation);

                //Output Style
                args.push('--style', file.config.outputStyle);

                //Compass
                if (file.config.compass) {

                    args.push('--compass');
                }

                if (file.config.sourcemaps && Prepros.PLATFORM_WINDOWS) {

                    args.push('--sourcemap');
                }

                if (file.config.debug) {

                    args.push('--debug-info');
                }

                //Sass bourbon
                args.push('--load-path', config.ruby.bourbon);

                //Bourbon neat framework
                args.push('--load-path', config.ruby.neat);

                //Bourbon bitters framework
                args.push('--load-path', config.ruby.bitters);

                if (file.config.lineNumbers) {
                    args.push('--line-numbers');
                }

                //Make output dir if it doesn't exist
                fs.mkdirsSync(path.dirname(output));
            }

            var cwd = (file.config.compass && file.config.fullCompass) ? project.path : path.dirname(input);

            var rubyProcess = cp.spawn(config.ruby.getExec('sass'), args, {cwd: cwd});

            var compileErr = false;

            rubyProcess.once('error', function (e) {

                compileErr = true;
                callback(new Error('Unable to execute ruby -error: ' + e.message));

            });

            //If there is a compilation error
            rubyProcess.stderr.on('data', function (data) {

                var string = data.toString().toLowerCase();

                //Dirty workaround to check if the message is real error or not
                if (string.length > 20 && string.indexOf('deprecation warning') < 0) {

                    compileErr = true;

                    callback(new Error(data.toString()));
                }

            });

            rubyProcess.stdout.on('data', function (data) {

                var string = data.toString().toLowerCase();

                if (string.indexOf('error') >= 0 && string.indexOf('deprecation warning') < 0) {

                    compileErr = true;

                    callback(new Error(data.toString()));
                }
            });

            //Success if there is no error
            rubyProcess.once('exit', function () {

                rubyProcess.removeAllListeners();

                if (file.config.fullCompass && file.config.compass && !compileErr) return callback(null, input);

                if (!compileErr) {

                    if (file.config.autoprefixer && !file.config.sourcemaps) {

                        fs.readFile(output, 'utf8', function (err, css) {

                            if (err) return callback(new Error('Autoprefixer: Failed to read file to autoprefix. ' + err.message));

                            try {

                                if (project.config.autoprefixerBrowsers) {

                                    var autoprefixerOptions = project.config.autoprefixerBrowsers.split(',').map(function (i) {
                                        return i.trim();
                                    });

                                    css = autoprefixer.apply(null, autoprefixerOptions).compile(css);

                                } else {

                                    css = autoprefixer().compile(css);
                                }

                                if (file.config.outputStyle === "compressed") {

                                    css = new CleanCss({processImport: false}).minify(css);
                                }

                                fs.outputFile(output, css, function (err) {

                                    if (err) {

                                        callback('Autoprefixer: Failed to write file ' + output + '\n' + err.message);

                                    } else {

                                        callback(null, input);
                                    }
                                });


                            } catch (e) {

                                callback('Failed autoprefix css\n' + e.message);

                            }

                        });

                    } else {

                        callback(null, input);
                    }

                }


                rubyProcess = null;
            });
        };

        return {
            compile: compile
        };
    }
]);