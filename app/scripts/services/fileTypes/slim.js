/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('slim', function (config, utils, notification) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        cp = require('child_process'),
        _id = utils.id;

    var format = function (filePath, projectPath) {

            //File name
            var name = path.basename(filePath);

            //Relative input path
            var shortInput = path.relative(projectPath, filePath).replace(/\\/g, '/');

            // Output path
            var output = filePath.replace(/\.slim/gi, config.getUserOptions().htmlExtension);

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
                type: 'Slim',
                input: filePath,
                shortInput: shortInput,
                output: output,
                shortOutput: shortOutput,
                config: config.getUserOptions().slim
            };
        };


        var compile = function (file) {

            var args = [config.ruby.gems.slim.path];

            //Input and output
            args.push(file.input, file.output);

            //Pretty
            if(file.config.pretty){

                args.push('--pretty');
            }

            fs.mkdirsSync(path.dirname(file.output));

            //Start a child process to compile the file
            var rubyProcess = cp.spawn(config.ruby.path, args);

            var compileErr = false;

            //If there is a compilation error
            rubyProcess.stderr.on('data', function (data) {

                compileErr = true;

                notification.error('Compilation Failed', 'Failed to compile ' + file.name, data.toString() + "\n" + file.input);

            });

            //Success if there is no error
            rubyProcess.on('exit', function(){
                if(!compileErr){

                    notification.success('Compilation Successful', 'Successfully compiled ' + file.name, file.input);

                }
            });
        };

    return {
        format: format,
        compile: compile
    };
});