/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('haml', function (config, utils, notification) {

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
            var output = filePath.replace(/\.haml/gi, config.user.htmlExtension);

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
                type: 'Haml',
                input: filePath,
                shortInput: shortInput,
                output: output,
                shortOutput: shortOutput,
                config: config.user.haml
            };
        };


        var compile = function (file) {

            var args = [config.ruby.gems.haml.path];

            //Input and output
            args.push(file.input, file.output);

            //Load path for @imports
            args.push('--load-path', path.dirname(file.input));

            //Output format
            args.push('--format', file.config.format);

            //Output style
            args.push('--style', file.config.outputStyle);

            //Double quote attributes
            if (file.config.doubleQuotes) {
                args.push('--double-quote-attributes');
            }

            fs.mkdirsSync(path.dirname(file.output));

            //Start a child process to compile the file
            var rubyProcess = cp.spawn(config.ruby.path, args);

            var compileErr = false;

            //If there is a compilation error
            rubyProcess.stderr.on('data', function (data) {

                compileErr = true;

                notification.error('Error compiling file.', data.toString() + "\n" + file.input);

            });

            //Success if there is no error
            rubyProcess.on('exit', function(){
                if(!compileErr){

                    notification.success('Successfully compiled', file.input);

                }
            });
        };

    return {
        format: format,
        compile: compile
    };
});