/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */


/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('sass', function (config, utils) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        cp = require('child_process'),
        _id = utils.id,
        autoprefixer = require('autoprefixer'),
        cssmin = require('ycssmin').cssmin;


    var format = function (pid, fid, filePath, projectPath) {

        //File name
        var name = path.basename(filePath);

        // Output path
        var output = filePath.replace(/\.sass|\.scss/gi, '.css');

        var pathRegx = /\\sass\\|\\scss\\|\/sass\/|\/scss\//gi;

        //Find output path; save to user defined css folder if file is in sass or scss folder
        if (filePath.match(pathRegx)) {

            var customOutput = path.normalize(output.replace(pathRegx, path.sep + '{{cssPath}}' + path.sep));

            if(utils.isFileInsideFolder(projectPath, customOutput)) {
                output = customOutput;
            }

        }

        var file = {
            id: fid,
            pid: pid,
            name: name,
            input: path.relative(projectPath, filePath),
            output: path.relative(projectPath, output),
            config: config.getUserOptions().sass
        };

        var ext = path.extname(filePath);

        if (ext === '.scss') {

            file.type = 'Scss';

        } else if (ext === '.sass') {

            file.type = 'Sass';
        }

        return file;

    };


    //Compile

    var compile = function (file, successCall, errorCall) {

        var args = [];

        if (file.config.fullCompass && file.config.compass) {

            args = config.ruby.getGem('compass');

            args.push('compile', path.relative(file.projectPath, file.input).replace(/\\/gi, '/'));

            args.push("--environment", 'development');

            //Output Style
            args.push('--output-style', file.config.outputStyle);

            //Line numbers
            if (!file.config.lineNumbers) {
                args.push('--no-line-comments');
            }

            //Debug info
            if (file.config.debug) {

                args.push('--debug-info');
            }

            //Debug info
            args.push('--boring');

        } else {

            args = config.ruby.getGem('sass');

            if (file.config.unixNewlines) {

                args.push('--unix-newlines');
            }

            //Input and output
            args.push(file.input, file.output);

            //Load path for @imports
            args.push('--load-path', path.dirname(file.input));

            //Convert backslashes to double backslashes which weirdly escapes single quotes from sass cache path fix #52
            var cacheLocation = config.cachePath.replace(/\\\\/gi, '\\\\');

            //Cache location
            args.push('--cache-location', cacheLocation);

            //Output Style
            args.push('--style', file.config.outputStyle);

            //Debug info
            if (file.config.debug) {

                args.push('--debug');
            }

            //Compass
            if (file.config.compass) {

                args.push('--compass');
            }

            //Sass bourbon
            args.push('--load-path', config.ruby.bourbon);

            //Bourbon neat framework
            args.push('--load-path', config.ruby.neat);

            //Line numbers
            if (file.config.lineNumbers) {
                args.push('--line-numbers');
            }

            //Make output dir if it doesn't exist
            fs.mkdirsSync(path.dirname(file.output));

        }

        //file.project path is exclusively provided to sass by compile provider
        var rubyProcess = cp.spawn(config.ruby.getExec('sass'), args, {cwd: file.projectPath});

        rubyProcess.on('error', function (e) {
            errorCall('Unable to execute ruby —error ' + e.message);
        });

        var compileErr = false;

        //If there is a compilation error
        rubyProcess.stderr.on('data', function (data) {

            //Dirty workaround to check if the message is real error or not
            if(data.toString().length > 20) {

                compileErr = true;

                errorCall(data.toString());
            }

        });

        rubyProcess.stdout.on('data', function (data) {

            if(data.toString().toLowerCase().indexOf('error') >= 0) {

                compileErr = true;

                errorCall(data.toString());
            }
        });

        //Success if there is no error
        rubyProcess.on('exit', function () {

            if (!compileErr) {

                if(file.config.autoprefixer && fs.existsSync(file.output)) {

                    try {

                        var css = fs.readFileSync(file.output).toString();

                        if(file.config.autoprefixerBrowsers) {

                            var autoprefixerOptions = file.config.autoprefixerBrowsers.split(',').map(function(i) {
                                return i.trim();
                            });

                            css =  autoprefixer.apply(null, autoprefixerOptions).compile(css);

                        } else {

                            css =  autoprefixer().compile(css);
                        }

                        if(file.config.outputStyle === "compressed") {

                            css = cssmin(css);
                        }

                        fs.outputFile(file.output, css);

                    } catch (e) {

                        errorCall('Failed to compile file due to autoprefixer error '+ e.message);
                        compileErr = true;
                    }
                }

                successCall(file.input);

            }

            rubyProcess.removeAllListeners();

            rubyProcess = null;
        });


    };

    return {
        format: format,
        compile: compile
    };
});