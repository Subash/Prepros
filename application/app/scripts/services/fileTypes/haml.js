/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros*/

prepros.factory('haml',[

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

            var args = config.ruby.getGem('haml');

            //Input and output
            args.push(input, output);

            //Load path for @imports
            args.push('--load-path', path.dirname(input));

            //Output format
            args.push('--format', file.config.format);

            //Output style
            args.push('--style', file.config.outputStyle);

            //Double quote attributes
            if (file.config.doubleQuotes) {
                args.push('--double-quote-attributes');
            }

            fs.mkdirs(path.dirname(output), function(err) {

                if(err) return callback(err);

                //Start a child process to compile the file
                var rubyProcess = cp.spawn(config.ruby.getExec('haml'), args);

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

                    if (!compileErr) callback(null, input);

                    rubyProcess = null;
                });

            });
        };

        return {
            compile: compile
        };
    }
]);