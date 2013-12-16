/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, curly: false*/
/*global prepros, _*/

prepros.factory('fileTypes', [

    'config',
    'coffee',
    'haml',
    'importsVisitor',
    'jade',
    'javascript',
    'less',
    'livescript',
    'markdown',
    'sass',
    'slim',
    'stylus',

    function (config, coffee, haml, importsVisitor, jade, javascript, less, livescript, markdown, sass, slim, stylus) {

        'use strict';

        var path = require('path');
        var fs = require('fs');

        //Map extension with file type
        var typeMap = {
            less: less,
            sass: sass,
            scss: sass,
            styl: stylus,
            md: markdown,
            markdown: markdown,
            coffee: coffee,
            js: javascript,
            jade: jade,
            haml: haml,
            slim: slim,
            ls: livescript
        };


        //function to format file based on it's type
        function format(pid, fid, filePath, projectPath, callback) {

            var extname = path.extname(filePath).toLowerCase().slice(1);

            var configTypes = {
                less: "less",
                sass: "sass",
                scss: "sass",
                styl: "stylus",
                md: "markdown",
                markdown: "markdown",
                coffee: "coffee",
                js: "javascript",
                jade: "jade",
                haml: "haml",
                slim: "slim",
                ls: "livescript"
            };

            var file = {
                id: fid,
                pid: pid,
                name: path.basename(filePath),
                input: path.relative(projectPath, filePath),
                customOutput: false,
                type: extname.charAt(0).toUpperCase() + extname.slice(1), //Capitalize First Letter
                config: config.getUserOptions()[configTypes[extname]]
            };

            //Some type Exceptions
            if (extname === 'markdown') file.type = 'MD';
            if (extname === 'styl') file.type = 'Stylus';

            //Use full compass if config.rb file is present
            if (extname === 'sass' || extname === 'scss') {

                fs.exists(path.join(projectPath, 'config.rb'), function (exists) {

                    if (exists) {

                        file.config.compass = true;
                        file.config.fullCompass = true;

                        callback(null, file);

                    } else {

                        callback(null, file);
                    }
                });

            } else {

                setTimeout(function () {
                    callback(null, file);
                }, 0);

            }
        }

        //Function to compile file based on it's type
        function compile(file, project, callback) {

            var extname = path.extname(file.input).toLowerCase().slice(1);

            typeMap[extname].compile(file, project, callback);

        }

        //Function to check if extension is supported
        function isExtSupported(filePath) {

            return !!getInternalType(filePath);

        }

        //Function to check if file is supported
        function isFileSupported(filePath) {

            //supported extension, Dot file, minified javascript, partial

            return isExtSupported(filePath) && !/\\\.|\/\./.test(filePath) && !/\.min.js$/.test(path.basename(filePath)) && !/^_/.test(path.basename(filePath));

        }

        //Get the default extension of compiled output
        function getCompiledExtension(filePath) {

            var internalType = getInternalType(filePath);

            switch (internalType) {

                case "JS":
                    return '.js';
                case "CSS":
                    return '.css';
                case "HTML":
                    return '.html';
                default:
                    return '';
            }
        }

        //Function return list of imports if file supports importing
        function getImports(filePath, callback) {

            var ext = path.extname(filePath).slice(1);

            var can = ['less', 'sass', 'scss', 'jade', 'styl', 'slim', 'js', 'coffee'];

            if (_.contains(can, ext)) {

                importsVisitor.getImports(filePath, callback);

            } else {

                setTimeout(function () {
                    callback(null, []);
                }, 0);
            }

        }

        //Function to get internal type like HTML, CSS, JS
        function getInternalType(filePath) {

            var ext = path.extname(filePath).slice(1);

            var css = ['scss', 'sass', 'styl', 'less'];
            var js = ['coffee', 'ls', 'js'];
            var html = ['jade', 'haml', 'md', 'markdown', 'slim'];
            var image = ['jpg', 'jpeg', 'png', 'tif', 'tiff'];

            if (_.contains(css, ext)) {

                return 'CSS';

            } else if (_.contains(html, ext)) {

                return 'HTML';

            } else if (_.contains(js, ext)) {

                return 'JS';

            } else if (_.contains(image, ext)) {

                return 'IMAGE';

            } else {

                return '';
            }
        }

        return {
            compile: compile,
            format: format,
            isExtSupported: isExtSupported,
            getImports: getImports,
            isFileSupported: isFileSupported,
            getCompiledExtension: getCompiledExtension,
            getInternalType: getInternalType
        };
    }
]);