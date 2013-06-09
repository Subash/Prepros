/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, _*/

prepros.factory('javascript', function (config, utils, importsVisitor) {

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
        var output = path.join(path.dirname(filePath), 'min', path.basename(filePath).replace(/\.js/gi, '-min.js'));

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
            type: 'JS',
            input: filePath,
            shortInput: shortInput,
            output: output,
            shortOutput: shortOutput,
            config: config.getUserOptions().javascript
        };
    };

    var compile = function (file, callback) {

        var ugly = require('uglify-js');

        var options = {};

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {
            if (err) {

                callback(true, err.message);

            } else {

                var error = false;

                var javascript = data.toString();

                _.each(importsVisitor.getImports(file.input), function (impfile) {

                    var contents = fs.readFileSync(impfile, { encoding: 'utf8' });

                    javascript = javascript + '\n' + contents.toString();
                });

                //Remove @prepros-import statements
                javascript = javascript.replace(/\/\/\s@prepros-append\s+(.*)\n/gi, '');

                if (file.config.uglify) {

                    javascript = ugly.minify(javascript, {fromString: true}).code;
                }

                fs.outputFile(file.output, javascript, function (err) {

                    if (err) {

                        callback(true, err.message);

                    } else {

                        callback(false, file.input);
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