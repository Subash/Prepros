/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('jade', function(config, utils, notification){

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
        var output = filePath.replace(/\.jade/gi, config.user.htmlExtension);

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
            type: 'Jade',
            input: filePath,
            shortInput: shortInput,
            output: output,
            shortOutput: shortOutput,
            config: config.user.jade
        };
    };

    var compile = function (file) {

        var jadeCompiler = require('jade');

        var options = {
            filename: file.input,
            pretty: file.config.pretty
        };

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {
            if (err) {

                notification.error('Error reading file.', file.input);

            } else {

                try {
                    var fn = jadeCompiler.compile(data.toString(), options);

                    var html = fn();

                    fs.outputFile(file.output, html, function (err) {

                        if (err) {
                            notification.error('Error writing file.', file.output);
                        } else {
                            notification.success('Successfully compiled', file.input);
                        }
                    });

                } catch (e) {

                    notification.error('Error compiling file.', e.message);
                }

            }
        });
    };


    return {
        compile: compile,
        format: format
    };

});