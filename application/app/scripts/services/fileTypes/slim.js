/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros*/

prepros.factory('slim', [

    'config',
    '$filter',

    function (config, $filter) {

        'use strict';

        var fs = require('fs-extra'),
            path = require('path'),
            cp = require('child_process');


        var compile = function (file, project, callback) {

            var input = path.resolve(project.path, file.input);

            var output = (file.customOutput)? path.resolve(project.path, file.customOutput): $filter('interpolatePath')(file.input, project);

            var args = config.ruby.getGem('slim');

            args.push('-oformat=' + file.config.format);

            if (file.config.indent === 'four') {
                args.push('-oindent="    "');

            } else if (file.config.indent === 'tab') {

                args.push('-oindent="\t"');
            }

            //Input and output
            args.push(input, output);

            //Pretty
            if (file.config.pretty) args.push('--pretty');

            fs.mkdirs(path.dirname(output), function(err) {

                if(err) return callback(err);

                //Start a child process to compile the file
                var rubyProcess = cp.spawn(config.ruby.getExec('slim'), args, {cwd: path.dirname(input)});

                rubyProcess.once('error', function (e) {
                    callback(new Error( 'Unable to execute ruby —error ' + e.message));
                });

                var compileErr = false;

                //If there is a compilation error
                rubyProcess.stderr.on('data', function (data) {

                    compileErr = true;

                    callback(new Error(data.toString() + "\n" + input));

                });

                //Success if there is no error
                rubyProcess.once('exit', function () {

                    rubyProcess.removeAllListeners();

                    if (!compileErr)  callback(null, input);

                    rubyProcess = null;
                });

            });
        };

        return {
            compile: compile
        };
    }
]);