/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('less', function(config, utils, notification){

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

        //Find output path; save to user defined css folder if file is in less folder
        if(filePath.match(/\\less\\|\/less\//gi)) {

            output = path.normalize(output.replace(/\\less\\|\/less\//gi, path.sep + config.user.cssPath + path.sep));

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
            config: config.user.less
        };

    };


    //Compile Less
    var compile = function(file){

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
                notification.error('Error reading file.', file.input);
            } else {

                //Must be in try catch block because less sometimes just throws errors rather than giving callbacks
                try {
                    parser.parse(data.toString(), function (e, tree) {
                        if (e) {
                            notification.error('Error compiling file', e.message + "\n"  + e.filename + ' line ' + e.line);
                        }
                        if (!e) {

                            try {

                                var css = tree.toCSS(options);

                                fs.outputFile(file.output, css, function (err) {

                                    if (err) {
                                        notification.error('Error writing file.', file.output);
                                    } else {
                                        notification.success('Successfully compiled', file.input);
                                    }

                                });

                            } catch(e ){

                                notification.error('Error compiling file', e.message + "\n"  + e.filename + ' line ' + e.line);

                            }


                        }
                    });
                } catch (e) {
                    notification.error('Error compiling file', e.message + "\n"  + e.filename + ' line ' + e.line);
                }

            }
        });
    };

    return {
        format: format,
        compile: compile
    };

});
