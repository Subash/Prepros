/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */


/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('stylus', function (config, utils) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        _id = utils.id,
        autoprefixer = require('autoprefixer');


    var format = function (pid, fid, filePath, projectPath) {

        //File name
        var name = path.basename(filePath);

        // Output path
        var output = filePath.replace(/\.styl/gi, '.css');

        var pathRegx = /\\styl\\|\\stylus\\|\/styl\/|\/stylus\//gi;

        //Find output path; save to user defined css folder if file is in styl or stylus folder
        if (filePath.match(pathRegx)) {

            var customOutput = path.normalize(output.replace(pathRegx, path.sep + '{{cssPath}}' + path.sep));

            if(utils.isFileInsideFolder(projectPath, output)) {
                output = customOutput;
            }

        }

        return {
            id: fid,
            pid: pid,
            name: name,
            type: 'Stylus',
            input: path.relative(projectPath, filePath),
            output: path.relative(projectPath, output),
            config: config.getUserOptions().stylus
        };
    };


    //Compile
    var compile = function (file, successCall, errorCall) {

        var stylus = require('stylus');

        var nib = require('nib');

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {

            if (err) {

                errorCall(err.message);

            } else {

                var importPath = path.dirname(file.input);

                var compiler = stylus(data.toString())
                    .set('filename', file.input)
                    .include(importPath);

                //Stylus nib plugin
                if (file.config.nib) {
                    compiler.use(nib());
                }

                //Compress
                if (file.config.compress) {
                    compiler.set('compress', true);
                } else {
                    compiler.set('compress', false);
                }


                //Line numbers
                if (file.config.lineNumbers) {
                    compiler.set('linenos', true);
                } else {
                    compiler.set('linenos', false);
                }

                //Render
                compiler.render(function (err, css) {
                    if (err) {

                        errorCall(err.message);

                    } else {

                        if(file.config.autoprefixer) {

                            try {

                                css =  autoprefixer.compile(css);

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
                    }
                });
            }
        });
    };

    return {
        format: format,
        compile: compile
    };
});