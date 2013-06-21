/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('jade', function(config, utils){

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
        var output = filePath.replace(/\.jade/gi, config.getUserOptions().htmlExtension);

        var pathRegx = /\\jade\\|\/jade\//gi;

        //Find output path; save to /html folder if file is in /jade folder
        if(filePath.match(pathRegx)) {

            output = path.normalize(output.replace(pathRegx, path.sep + '{{htmlPath}}' + path.sep));

        }

        //Find short output path
        var shortOutput = output;

        //Show Relative path if output file is within project folder
        if (path.relative(projectPath, filePath).indexOf('.' + path.sep) === -1) {

            shortOutput = path.relative(projectPath, output);
        }

        return {
            id: _id(filePath),
            pid: _id(projectPath),
            name: name,
            type: 'Jade',
            input: filePath,
            shortInput: shortInput,
            output: output,
            shortOutput: shortOutput,
            config: config.getUserOptions().jade
        };
    };

    var compile = function (file, successCall, errorCall) {

        var jadeCompiler = require('jade');

        var options = {
            filename: file.input,
            pretty: file.config.pretty
        };

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {
            if (err) {

                errorCall(err.message);

            } else {

                try {
                    var fn = jadeCompiler.compile(data.toString(), options);

                    var html = fn();

                    fs.outputFile(file.output, html, function (err) {

                        if (err) {

                            errorCall(err.message);

                        } else {

                            successCall(file.input);

                        }
                    });

                } catch (e) {

                    errorCall(e.message + '\n' + file.input);
                }
            }
        });
    };


    return {
        compile: compile,
        format: format
    };

});