/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, _*/

'use strict';

prepros.factory('fileTypes', function (less, sass, stylus, markdown, coffee, jade, haml, slim, config, importsVisitor) {

    var path = require('path');

    //Map extension with file type
    var typeMap = {
        less: less,
        sass: sass,
        scss: sass,
        styl: stylus,
        md : markdown,
        markdown : markdown,
        coffee: coffee,
        jade: jade,
        haml: haml,
        slim: slim
    };


    //function to format file based on it's type
    function format(filePath, projectPath) {

        var extname = path.extname(filePath).toLowerCase().slice(1);

        return typeMap[extname].format(filePath, projectPath);

    }

    //Function to compile file based on it's type
    function compile(file, callback) {

        var extname = path.extname(file.input).toLowerCase().slice(1);

        typeMap[extname].compile(file, callback);

    }

    //Function to check if extension is supported
    function isExtSupported(filePath){

        var extname = path.extname(filePath).toLowerCase();

        var supportedExtensions = [
            '.less', //Less
            '.sass', '.scss', //Sass
            '.styl', //Stylus
            '.md', '.markdown', //Markdown
            '.coffee', //Coffeescript
            '.jade', //Jade
            '.haml',  //Haml
            '.slim'  //Slim
        ];

        return _.contains(supportedExtensions, extname);

    }

    //Function to check if file is supported
    function isFileSupported(filePath) {

        var extname = path.extname(filePath).toLowerCase();

        //Sass partials are not supported
        var sass = ['sass', 'scss'];

        var partial = /^_/;

        var isSassPartial = _.contains(sass, extname) && partial.exec(path.basename(filePath));

        return isExtSupported(filePath) && !isSassPartial;

    }

    //Get the default extension of compiled output
    function getCompiledExtension(filePath){

        var ext = path.extname(filePath).slice(1);

        var css = ['scss', 'sass', 'stylus', 'less'];
        var js = ['coffee'];
        var html = ['jade', 'haml', 'md', 'markdown', 'slim'];

        if(_.contains(css, ext)){

            return '.css';

        } else if(_.contains(html, ext)) {

            return config.getUserOptions().htmlExtension;

        } else if(_.contains(js, ext)){

            return '.js';

        } else {

            return '';
        }

    }

    //Function to find if file can import another file
    function canImport(filePath) {

        var ext = path.extname(filePath).slice(1);

        var can = ['less', 'sass', 'scss', 'jade', 'styl'];

        return _.contains(can, ext);

    }


    return {
        compile : compile,
        format: format,
        isExtSupported: isExtSupported,
        canImport: canImport,
        getImports: importsVisitor.getImports,
        isFileSupported: isFileSupported,
        getCompiledExtension: getCompiledExtension
    };
});