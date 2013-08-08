/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, _*/

//Exception handler service
prepros.factory('$exceptionHandler',function(){

    'use strict';

    //Replace console.warn to hide warnings
    console.warn = function() {

    };

    //Save exception data to file
    process.on('uncaughtException', function(err) {
        var errorLogPath = require('path').join(require('nw.gui').App.dataPath[0], 'prepros-error-log.txt');
        require('fs-extra').appendFile(errorLogPath, '\n[ ' + new Date().toDateString() + ' ]\n' + err.stack.toString() + '\n');
        console.error(err.stack);
    });

    return function(err){
        var errorLogPath = require('path').join(require('nw.gui').App.dataPath[0], 'prepros-error-log.txt');
        require('fs-extra').appendFile(errorLogPath, '\n[ ' + new Date().toDateString() + ' ]\n' + err.stack.toString() + '\n');
        console.error(err.stack);
    };
});