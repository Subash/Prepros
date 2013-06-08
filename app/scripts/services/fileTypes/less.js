/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */


/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('less', function(config, utils){

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        _id = utils.id;


    var format = function(filePath, projectPath){

        //File name
        var name = path.basename(filePath);

        //Relative input path
        var shortInput = path.relative(projectPath, filePath).replace(/\\/g, '/');

        // Output path
        var output = filePath.replace(/\.less/gi, '.css');

        var pathRegx = /\\less\\|\/less\//gi;

        //Find output path; save to user defined css folder if file is in less folder
        if(filePath.match(pathRegx)) {

            output = path.normalize(output.replace(pathRegx, path.sep + '{{cssPath}}' + path.sep));

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
            type : 'Less',
            input: filePath,
            shortInput: shortInput,
            output: output,
            shortOutput: shortOutput,
            config: config.getUserOptions().less
        };

    };


    //Compile Less
    var compile = function(file, callback){

        var less = require('less');

        var options = {};

        var importPath = path.dirname(file.input);

        if(file.config.compress){

            options.yuicompress = file.config.compress;

        }

        var parser = new (less.Parser)({
            paths: [importPath],
            filename: file.input,
            dumpLineNumbers: (file.config.lineNumbers)? 'comments': false
        });

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {
            if (err) {

                callback(true, err.message);

            } else {

                //Must be in try catch block because less sometimes just throws errors rather than giving callbacks
                try {
                    parser.parse(data.toString(), function (e, tree) {
                        if (e) {

                            callback(true, e.message + "\n"  + e.filename + ' line ' + e.line);

                        }
                        if (!e) {

                            try {

                                var css = tree.toCSS(options);

                                fs.outputFile(file.output, css, function (err) {

                                    if (err) {

                                        callback(true, err.message);


                                    } else {

                                        callback(false, file.input);

                                    }

                                });

                            } catch(e ){

                                callback(true, e.message + "\n"  + e.filename + ' line ' + e.line);

                            }


                        }
                    });
                } catch (e) {

                    callback(true, e.message + "\n"  + e.filename + ' line ' + e.line);
                }

            }
        });
    };

    return {
        format: format,
        compile: compile
    };

});
