/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('stylus', function (config, utils, notification) {

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
        var output = filePath.replace(/\.styl/gi, '.css');

        //Find output path; save to user defined css folder if file is in styl or stylus folder
        if(filePath.match(/\\styl\\|\\stylus\\|\/styl\/|\/stylus\//gi)) {

            output = path.normalize(output.replace(/\\styl\\|\\stylus\\|\/styl\/|\/stylus\//gi, path.sep + config.user.cssPath + path.sep));

        }

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
            type: 'Stylus',
            input: filePath,
            shortInput: shortInput,
            output: output,
            shortOutput: shortOutput,
            config: config.user.stylus
        };
    };


    //Compile
    var compile = function (file) {

        var stylus = require('stylus');

        var nib = require('nib');

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {

            if (err) {

                notification.error('Error reading file', err);

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

                        notification.error('Error compiling file.', err.message);

                    } else {

                        fs.outputFile(file.output, css, function (err) {

                            if (err) {
                                notification.error('Error writing file.', file.output);
                            } else {
                                notification.success('Successfully compiled', file.input);
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