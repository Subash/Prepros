/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, _, $*/

//Exception handler service
prepros.factory('$exceptionHandler', [

    function(){

        'use strict';

        //Replace console.warn to hide warnings
        console.warn = function() {

        };

        //Save exception data to file
        process.on('uncaughtException', function(err) {

            var errorLogPath = require('path').join(require('nw.gui').App.dataPath[0], 'prepros-error-log.txt');
            require('fs-extra').appendFile(errorLogPath, '\n[ ' + new Date().toDateString() + ' ]\n' + err.stack.toString() + '\n');
            console.error(err.stack);

            if(/watch EPERM/.test(err.message)) {
                return;
            }

            //Disable actions to prevent further errors
            $('body').css({pointerEvents: 'none'});
            $('.wrapper').css({opacity: '0.5'});
            $('#title-bar-close-button').css({pointerEvents: 'auto'});
            window.alert('An exception occurred.\n ' + errorLogPath);
        });

        return function(err){

            var errorLogPath = require('path').join(require('nw.gui').App.dataPath[0], 'prepros-error-log.txt');
            require('fs-extra').appendFile(errorLogPath, '\n[ ' + new Date().toDateString() + ' ]\n' + err.stack.toString() + '\n');

            //Disable actions to prevent further errors
            $('body').css({pointerEvents: 'none'});
            $('.wrapper').css({opacity: '0.5'});
            $('#title-bar-close-button').css({pointerEvents: 'auto'});

            console.error(err.stack);
            window.alert('An exception occurred.\n ' + errorLogPath);
        };
    }
]);