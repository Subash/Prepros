/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('coffee', function(config, utils, notification){

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
        var output = filePath.replace(/\.coffee/gi, '.js');

        //Find short output path
        var shortOutput = filePath.replace(/\.coffee/gi, '.js').replace(/\\/g, '/');

        //Find output path; save to /js folder if file is in /coffee folder
        if (path.basename(path.dirname(filePath)).toLowerCase() === 'coffee') {

            output = path.dirname(path.dirname(filePath)) + '\\' + config.user.jsPath + '\\' + path.basename(filePath).replace(/\.coffee/gi, '.js');
        }

        //Show Relative path if output file is within project folder
        if (path.relative(projectPath, filePath).indexOf('.\\') === -1) {

            shortOutput = path.relative(projectPath, output).replace(/\.coffee/gi, '.js').replace(/\\/g, '/');
        }

        return {

            id: _id(filePath),
            pid: _id(projectPath),
            name: name,
            type: 'Coffee',
            input: filePath,
            shortInput: shortInput,
            output: output,
            shortOutput: shortOutput,
            config: config.user.coffee
        };
    };

    var compile = function (file) {

        var coffee = require('coffee-script');

        var ugly = require('uglify-js');

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {
            if (err) {

                notification.error('Error reading file.', file.input);

            } else {

                try {

                    var javascript = coffee.compile(data.toString());

                    if (file.config.uglify) {

                        javascript = ugly.minify(javascript, {fromString: true}).code;
                    }

                    fs.outputFile(file.output, javascript, function (err) {

                        if (err) {
                            notification.error('Error writing file.', file.output);
                        }

                    });


                } catch (e) {

                    notification.error('Error compiling file', e.message + "\n" + file.input);

                }
            }
        });
    };

    return {
        format: format,
        compile: compile
    };
});