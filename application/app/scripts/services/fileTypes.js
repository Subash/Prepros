/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, _*/

prepros.factory('fileTypes',[

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

    function (
        config,
        coffee,
        haml,
        importsVisitor,
        jade,
        javascript,
        less,
        livescript,
        markdown,
        sass,
        slim,
        stylus
    ) {

        'use strict';

        var path = require('path');

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
        function format(pid, fid, filePath, projectPath) {

            var extname = path.extname(filePath).toLowerCase().slice(1);

            return typeMap[extname].format(pid, fid, filePath, projectPath);

        }

        //Function to compile file based on it's type
        function compile(file, successCall, errorCall) {

            var extname = path.extname(file.input).toLowerCase().slice(1);

            typeMap[extname].compile(file, successCall, errorCall);

        }

        //Function to check if extension is supported
        function isExtSupported(filePath) {

            var extname = path.extname(filePath).toLowerCase();

            var supportedExtensions = [
                '.less', //Less
                '.sass', '.scss', //Sass
                '.styl', //Stylus
                '.md', '.markdown', //Markdown
                '.coffee', //Coffeescript
                '.js', //Javascript
                '.jade', //Jade
                '.haml',  //Haml
                '.slim',  //Slim
                '.ls' //LiveScript
            ];

            return _.contains(supportedExtensions, extname);

        }

        //Function to check if file is supported
        function isFileSupported(filePath) {

            var extname = path.extname(filePath).toLowerCase().slice(1);

            var isPartial = /^_/.test(path.basename(filePath));

            var isDotFile = /\\\.|\/\./.test(filePath);

            //Minified js files are also not supported
            var js = ['js'];

            var minified = /\.min.js$/;

            var isMinified = _.contains(js, extname) && minified.exec(path.basename(filePath));

            return isExtSupported(filePath) && !isPartial && !isMinified && isDotFile;

        }

        //Get the default extension of compiled output
        function getCompiledExtension(filePath) {

            var ext = path.extname(filePath).slice(1);

            var css = ['scss', 'sass', 'stylus', 'less'];
            var js = ['coffee', 'ls', 'js'];
            var html = ['jade', 'haml', 'md', 'markdown', 'slim'];

            if (_.contains(css, ext)) {

                return '.css';

            } else if (_.contains(html, ext)) {

                return config.getUserOptions().htmlExtension;

            } else if (_.contains(js, ext)) {

                return '.js';

            } else {

                return '';
            }

        }

        //Function return list of imports if file supports importing
        function getImports(filePath, projectPath) {

            var ext = path.extname(filePath).slice(1);

            var can = ['less', 'sass', 'scss', 'jade', 'styl', 'slim', 'js', 'coffee'];

            return (_.contains(can, ext)) ? importsVisitor.getImports(filePath, projectPath) : [];

        }


        return {
            compile: compile,
            format: format,
            isExtSupported: isExtSupported,
            getImports: getImports,
            isFileSupported: isFileSupported,
            getCompiledExtension: getCompiledExtension
        };
    }
]);