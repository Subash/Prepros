/*jshint browser: true, node: true*/
/*global prepros,  _ */

//Storage
prepros.factory('fileTypes', function (storage, notification, config, utils) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        walker = require('node-walker'),
        cp = require('child_process'),
        _id = utils.id;

    //Function to get files list imported by another file; returns the list of imported files that exist
    function visitImports(filePath) {

        var importedFiles = [],
            ext = path.extname(filePath).toLowerCase(),
            data = fs.readFileSync(filePath).toString(),
            result,
            basedir = path.dirname(filePath),
            importedFilePath,
            importReg;

        //Strip out comments
        data = data.replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '');

        if (ext === '.less') {

            importReg = /@import[\s\("']*([^"'\);\n]+)[;\)"']*/g;

            while ((result = importReg.exec(data)) !== null) {

                //Check if path is full or just relative
                if (result[1].indexOf(':') >= 0) {
                    importedFilePath = path.normalize(result[1]);
                } else {
                    importedFilePath = path.normalize(path.join(basedir, result[1]));
                }

                //Add extension if file doesn't have that
                if (path.extname(importedFilePath).toLowerCase() !== ext) {
                    importedFilePath = importedFilePath + ext;
                }

                //Check if file exists
                if (fs.existsSync(importedFilePath)) {

                    importedFiles.push(importedFilePath);
                }


            }

        } else if (ext === '.styl') {

            importReg = /@import\s["']*([^"';\n]+)[;"']*/g;

            while ((result = importReg.exec(data)) !== null) {


                //Check if path is full or just relative
                if (result[1].indexOf(':') >= 0) {
                    importedFilePath = path.normalize(result[1]);
                } else {
                    importedFilePath = path.normalize(path.join(basedir, result[1]));
                }


                //Add extension if file doesn't have that
                if (path.extname(importedFilePath).toLowerCase() !== ext) {
                    importedFilePath = importedFilePath + ext;
                }


                //Check if file exists
                if (fs.existsSync(importedFilePath)) {

                    importedFiles.push(importedFilePath);
                }

            }

        } else if (ext === '.jade') {

            importReg = /include\s([^\n\s]+)*/g;

            while ((result = importReg.exec(data)) !== null) {

                var fPath = result[1].trim();

                //Check if path is full or just relative
                if (fPath.indexOf(':') >= 0) {
                    importedFilePath = path.normalize(fPath);
                } else {
                    importedFilePath = path.normalize(path.join(basedir, fPath));
                }

                //Add extension if file doesn't have that
                if (path.extname(importedFilePath).toLowerCase() !== ext) {
                    importedFilePath = importedFilePath + ext;
                }

                //Check if file exists
                if (fs.existsSync(importedFilePath)) {
                    importedFiles.push(importedFilePath);
                }



            }

        } else if (ext === '.sass' || ext === '.scss') {

            importReg = /@import[ \("']*([^;]+)[;\)"']*/g;

            var i;

            while ((result = importReg.exec(data)) !== null) {

                
                var res = result[1].replace(/"|'/gi, "").split(",");

                for (i = 0; i < res.length; i++) {

                    var imp = res[i].trim();

                    if (imp && imp.indexOf(":") >= 0) {

                        importedFilePath = path.normalize(imp);
                    } else {
                        importedFilePath = path.normalize(path.join(basedir, imp));
                    }

                    //Add extension if file doesn't have that
                    if (path.extname(importedFilePath).toLowerCase() !== ext) {
                        importedFilePath = importedFilePath + ext;
                    }

                    //First check for partial file
                    var importedWithPartial = path.dirname(importedFilePath) + "\\_" + path.basename(importedFilePath);

                    //Check if file exists
                    if (fs.existsSync(importedWithPartial)) {

                        importedFiles.push(importedWithPartial);

                    } else if (fs.existsSync(importedFilePath)) {

                        importedFiles.push(importedFilePath);

                    }
                }

            }

        }

        return importedFiles;
    }

    //Function to add stylesheet such as .sass .scss .less .styl
    function _formatStylesheet(filePath, projectPath) {

        //File Extension
        var ext = path.extname(filePath);

        //File name
        var name = path.basename(filePath);

        //Relative input path
        var shortInput = path.relative(projectPath, filePath).replace(/\\/g, '/');

        // Output path
        var output = filePath.replace(ext, '.css');

        //Find output path; save to user defined css folder if file is in /less , /scss , /sass or /styl folder
        if (path.basename(path.dirname(filePath)).toLowerCase() === ext.toLowerCase().substr(1)) {

            output = path.dirname(path.dirname(filePath)) + '\\' + config.user.cssPath + '\\' + path.basename(filePath).replace(ext, '.css');
        }

        //Find short output path
        var shortOutput = filePath.replace(ext, '.css').replace(/\\/g, '/');

        //Show Relative path if output file is within project folder
        if (path.relative(projectPath, filePath).indexOf('.\\') === -1) {

            shortOutput = path.relative(projectPath, output).replace(ext, '.css').replace(/\\/g, '/');
        }

        var file = {
            id: _id(filePath),
            pid: _id(projectPath),
            name: name,
            input: filePath,
            shortInput: shortInput,
            output: output,
            shortOutput: shortOutput,
            config: {
                autoCompile: true,
                lineNumbers: false
            }
        };

        if (ext === '.less') {
            file.type = 'Less';
            file.config.compress = true;

        } else if (ext === '.scss') {
            file.type = 'Scss';
            file.config.compass = false;
            file.config.outputStyle = 'compressed'; //compressed, nested, expanded
        }

        else if (ext === '.sass') {
            file.type = 'Sass';
            file.config.compass = false;
            file.config.outputStyle = 'compressed'; //compressed, nested, expanded
        }

        else if (ext === '.styl') {
            file.type = 'Stylus';
            file.config.nib = false;
            file.config.compress = true;
        }

        return file;
    }


    //File type .less
    var less = {

        format: function (filePath, projectPath) {

            return _formatStylesheet(filePath, projectPath);

        },

        compile: function (file) {

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

                                var css = tree.toCSS(options);

                                fs.outputFile(file.output, css, function (err) {

                                    if (err) {
                                        notification.error('Error writing file.', file.output);
                                    }

                                });
                            }
                        });
                    } catch (e) {
                        notification.error('Error compiling file', e.message + "\n"  + e.filename + ' line ' + e.line);
                    }

                }
            });
        }
    };

    //file type .sass and .scss
    var sass = {
        format: function (filePath, projectPath) {

            return _formatStylesheet(filePath, projectPath);

        },
        compile: function (file) {

            var args = [config.languages.sass.path];

            //Input and output
            args.push(file.input, file.output);

            //Load path for @imports
            args.push('--load-path', path.dirname(file.input));

            //Cache location
            args.push('--cache-location', process.env.TEMP + '/PreprosCache');

            //Output Style
            args.push('--style', file.config.outputStyle);

            //Compass
            if (file.config.compass) {
                args.push('--compass');
            }

            //Line numbers
            if (file.config.lineNumbers) {
                args.push('--line-numbers');
            }

            //Make output dir if it doesn't exist
            fs.mkdirsSync(path.dirname(file.output));

            //Start a child process to compile the file
            var rubyProcess = cp.spawn(config.languages.ruby.path, args);

            //If there is a compilation error
            rubyProcess.stderr.on('data', function (data) {

                notification.error('Error compiling file', data.toString());

            });
        }
    };

    //File type stylus
    var stylus = {
        format: function (filePath, projectPath) {

            return _formatStylesheet(filePath, projectPath);

        },
        compile: function (file) {

            var stylus = require('stylus');

            var nib = require('nib');

            fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {

                if (err) {

                    notification.error('Error reading file', err);

                } else {

                    var importPath = path.dirname(file.input);

                    var compiler = stylus(data.toString())
                        .set('filename', file.input)
                        .include(importPath);

                    //Stylus nib plugin
                    if (file.config.nib) {
                        compiler.use(nib());
                    }

                    //Compress
                    if (file.config.compress) {
                        compiler.set('compress', true);
                    } else {
                        compiler.set('compress', false);
                    }


                    //Line numbers
                    if (file.config.lineNumbers) {
                        compiler.set('linenos', true);
                    } else {
                        compiler.set('linenos', false);
                    }

                    //Render
                    compiler.render(function (err, css) {
                        if (err) {

                            notification.error('Error compiling file.', err.message);

                        } else {

                            fs.outputFile(file.output, css, function (err) {

                                if (err) {
                                    notification.error('Error writing file.', file.output);
                                }

                            });
                        }
                    });
                }
            });
        }
    };

    //File type markdown
    var markdown = {

        format: function (filePath, projectPath) {

            //File Extension
            var ext = path.extname(filePath);

            //File name
            var name = path.basename(filePath);

            //Relative input path
            var shortInput = path.relative(projectPath, filePath).replace(/\\/g, '/');

            // Output path
            var output = filePath.replace(ext, '.html');

            //Find short output path
            var shortOutput = filePath.replace(ext, '.html').replace(/\\/g, '/');

            //Show Relative path if output file is within project folder
            if (path.relative(projectPath, filePath).indexOf('.\\') === -1) {

                shortOutput = path.relative(projectPath, output).replace(ext, '.html').replace(/\\/g, '/');
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
                config: {
                    autoCompile: true,
                    sanitize: false,
                    gfm: true
                }
            };
        },

        compile: function (file) {

            var marked = require('marked');

            // Set default
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

                        fs.outputFile(file.output, html)

                    } catch(e) {
                        notification.error('Error compiling markdown file.', file.output);
                    }

                }
            });
        }
    };


    //File type coffeescript
    var coffee = {

        format: function (filePath, projectPath) {

            //File Extension
            var ext = path.extname(filePath);

            //File name
            var name = path.basename(filePath);

            //Relative input path
            var shortInput = path.relative(projectPath, filePath).replace(/\\/g, '/');

            // Output path
            var output = filePath.replace(ext, '.js');

            //Find short output path
            var shortOutput = filePath.replace(ext, '.js').replace(/\\/g, '/');

            //Find output path; save to /js folder if file is in /coffee folder
            if (path.basename(path.dirname(filePath)).toLowerCase() === ext.toLowerCase().substr(1)) {

                output = path.dirname(path.dirname(filePath)) + '\\' + config.user.jsPath + '\\' + path.basename(filePath).replace(ext, '.js');
            }

            //Show Relative path if output file is within project folder
            if (path.relative(projectPath, filePath).indexOf('.\\') === -1) {

                shortOutput = path.relative(projectPath, output).replace(ext, '.js').replace(/\\/g, '/');
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
                config: {
                    autoCompile: true,
                    uglify: false
                }
            };
        },

        compile: function (file) {

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
        }
    };

    //File type .jade
    var jade = {
        format: function (filePath, projectPath) {

            //File Extension
            var ext = path.extname(filePath);

            //File name
            var name = path.basename(filePath);

            //Relative input path
            var shortInput = path.relative(projectPath, filePath).replace(/\\/g, '/');

            // Output path
            var output = filePath.replace(ext, '.html');

            //Find short output path
            var shortOutput = filePath.replace(ext, '.html').replace(/\\/g, '/');

            //Show Relative path if output file is within project folder
            if (path.relative(projectPath, filePath).indexOf('.\\') === -1) {

                shortOutput = path.relative(projectPath, output).replace(ext, '.html').replace(/\\/g, '/');
            }

            return {
                id: _id(filePath),
                pid: _id(projectPath),
                name: name,
                type: 'Jade',
                input: filePath,
                shortInput: shortInput,
                output: output,
                shortOutput: shortOutput,
                config: {
                    autoCompile: true,
                    pretty: true
                }
            };
        },

        compile: function (file) {

            var jadeCompiler = require('jade');

            var options = {
                filename: file.input,
                pretty: file.config.pretty
            };

            fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {
                if (err) {

                    notification.error('Error reading file.', file.input);

                } else {

                    try {
                        var fn = jadeCompiler.compile(data.toString(), options);

                        var html = fn();

                        fs.outputFile(file.output, html, function (err) {

                            if (err) {
                                notification.error('Error writing file.', file.output);
                            }

                        });

                    } catch (e) {

                        notification.error('Error compiling file.', e.message);
                    }

                }
            });
        }
    };


    //File type .haml
    var haml = {

        format: function (filePath, projectPath) {

            //File Extension
            var ext = path.extname(filePath);

            //File name
            var name = path.basename(filePath);

            //Relative input path
            var shortInput = path.relative(projectPath, filePath).replace(/\\/g, '/');

            // Output path
            var output = filePath.replace(ext, '.html');

            //Find short output path
            var shortOutput = filePath.replace(ext, '.html').replace(/\\/g, '/');

            //Show Relative path if output file is within project folder
            if (path.relative(projectPath, filePath).indexOf('.\\') === -1) {

                shortOutput = path.relative(projectPath, output).replace(ext, '.html').replace(/\\/g, '/');
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
                config: {
                    autoCompile: true,
                    format: 'html5', //xhtml, html5
                    outputStyle: 'indented', //indented, ugly
                    doubleQuotes: false
                }
            };
        },

        compile: function (file) {

            var args = [config.languages.haml.path];

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
            var rubyProcess = cp.spawn(config.languages.ruby.path, args);

            //If there is a compilation error
            rubyProcess.stderr.on('data', function (data) {

                notification.error('Error compiling file.', data.toString() + "\n" + file.input);

            });
        }
    };

    return {
        less: less,
        sass: sass,
        stylus: stylus,
        markdown: markdown,
        coffee: coffee,
        jade: jade,
        haml: haml,


        visitImports: visitImports
    };
});