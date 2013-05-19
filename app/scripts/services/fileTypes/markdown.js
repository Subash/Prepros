/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('markdown', function (config, utils, notification) {

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
        var output = filePath.replace(/\.markdown|\.md/gi, config.user.htmlExtension);

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
            type: 'MD',
            input: filePath,
            shortInput: shortInput,
            output: output,
            shortOutput: shortOutput,
            config: config.user.markdown
        };
    };

    var compile = function (file) {

        var marked = require('marked');

        // Set markdown options
        marked.setOptions({
            gfm: file.config.gfm,
            sanitize: file.config.sanitize
        });

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {
            if (err) {
                notification.error('Error reading file.', file.input);
            } else {

                try {
                    var html = marked(data.toString());

                    fs.outputFile(file.output, html, function (err) {

                        if (err) {
                            notification.error('Error writing file.', file.output);
                        } else {
                            notification.success('Successfully compiled', file.input);
                        }

                    });

                } catch(e) {
                    notification.error('Error compiling markdown file.', file.output);
                }

            }
        });
    };

    return {
        format: format,
        compile: compile
    };
});