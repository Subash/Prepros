/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('haml', function (config, utils) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        cp = require('child_process'),
        _id = utils.id;

    var format = function (filePath, projectPath) {

            //File name
            var name = path.basename(filePath);

            //Relative input path
            var shortInput = path.relative(projectPath, filePath);

            // Output path
            var output = filePath.replace(/\.haml/gi, config.getUserOptions().htmlExtension);

            var pathRegx = /\\haml\\|\/haml\//gi;

            //Find output path; save to /html folder if file is in /haml folder
            if(filePath.match(pathRegx)) {

                output = path.normalize(output.replace(pathRegx, path.sep + '{{htmlPath}}' + path.sep));

            }

            return {
                id: _id(filePath),
                pid: _id(projectPath),
                name: name,
                type: 'Haml',
                input: filePath,
                shortInput: shortInput,
                output: output,
                config: config.getUserOptions().haml
            };
        };


        var compile = function (file, successCall, errorCall) {

            var args = [config.ruby.getGem('haml')];

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

            try {

                //Start a child process to compile the file
                var rubyProcess = cp.spawn(config.ruby.getExec('haml'), args);

                var compileErr = false;

                //If there is a compilation error
                rubyProcess.stderr.on('data', function (data) {

                    compileErr = true;

                    errorCall(data.toString() + "\n" + file.input);

                });

                //Success if there is no error
                rubyProcess.on('exit', function(){
                    if(!compileErr){

                        successCall(file.input);

                        rubyProcess = null;

                    }
                });

            } catch (e) {

                errorCall('Unable to execute ruby' + e.message);

            }

        };

    return {
        format: format,
        compile: compile
    };
});