/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */


/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('less', function (config, utils) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        _id = utils.id,
        autoprefixer = require('autoprefixer'),
        cssmin = require('ycssmin').cssmin;


    var format = function (pid, fid, filePath, projectPath) {

        //File name
        var name = path.basename(filePath);

        // Output path
        var output = filePath.replace(/\.less/gi, '.css');

        var pathRegx = /\\less\\|\/less\//gi;

        //Find output path; save to user defined css folder if file is in less folder
        if (filePath.match(pathRegx)) {

            var customOutput = path.normalize(output.replace(pathRegx, path.sep + '{{cssPath}}' + path.sep));

            if(utils.isFileInsideFolder(projectPath, customOutput)) {
                output = customOutput;
            }

        }

        return {
            id: fid,
            pid: pid,
            name: name,
            type: 'Less',
            input: path.relative(projectPath, filePath),
            output: path.relative(projectPath, output),
            config: config.getUserOptions().less
        };

    };


    //Compile Less
    var compile = function (file, successCall, errorCall) {

        var less = require('less');

        var options = {};

        var importPath = path.dirname(file.input);

        if (file.config.compress) {

            options.yuicompress = file.config.compress;

        }

        options.strictMath = file.config.strictMath;
        options.strictUnits = file.config.strictUnits;

        var parser = new (less.Parser)({
            paths: [importPath],
            filename: file.input,
            dumpLineNumbers: (file.config.lineNumbers) ? 'comments' : false
        });

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {
            if (err) {

                errorCall(err.message);

            } else {

                //Must be in try catch block because less sometimes just throws errors rather than giving callbacks
                try {
                    parser.parse(data.toString(), function (e, tree) {
                        if (e) {

                            errorCall(e.message + "\n" + e.filename + ' line ' + e.line);

                        }
                        if (!e) {

                            try {

                                var css = tree.toCSS(options);

                                if(file.config.autoprefixer) {

                                    try {

                                        if(file.config.autoprefixerBrowsers) {

                                            var autoprefixerOptions = file.config.autoprefixerBrowsers.split(',').map(function(i) {
                                                return i.trim();
                                            });

                                            css =  autoprefixer.apply(null, autoprefixerOptions).compile(css);

                                        } else {

                                            css =  autoprefixer().compile(css);
                                        }

                                        if(file.config.compress) {

                                            css = cssmin(css);
                                        }

                                    } catch (e) {

                                        errorCall('Failed to compile file due to autoprefixer error '+ e.message);
                                    }
                                }

                                fs.outputFile(file.output, css, function (err) {

                                    if (err) {

                                        errorCall(err.message);


                                    } else {

                                        successCall(file.input);

                                    }

                                });

                            } catch (e) {

                                errorCall(e.message + "\n" + e.filename + ' line ' + e.line);

                            }


                        }
                    });
                } catch (e) {

                    errorCall(e.message + "\n" + e.filename + ' line ' + e.line);
                }

            }
        });
    };

    return {
        format: format,
        compile: compile
    };

});
