/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, _, $, Prepros*/

//Exception handler service
prepros.factory('$exceptionHandler', [

    function () {

        'use strict';

        var fs = require('fs-extra');
        var path = require('path');
        var os = require('os');

        //Replace console.warn to hide warnings
        console.warn = function () {
        };

        var handle = function (err) {

            var errorLogPath = require('path').join( process.env.USERPROFILE || process.env.HOMEPATH || process.env.HOME, 'Prepros-Error-Log.html');

            fs.appendFile(errorLogPath, ' <div class="error"> \n <b> [ ' + new Date().toDateString() + ' : ' + new Date().toTimeString() + ' ]</b> \n <pre>\n ' + err.stack.toString() + '\n </pre> \n <hr> \n </div> \n');

            console.error(err, err.stack);

            if (err.message.indexOf('watch ') >= 0 || err.code === 'ECONNRESET') {
                return;
            }

            //Show and focus window
            Prepros.Window.show();
            Prepros.Window.focus();

            //Disable actions to prevent further errors
            $('body').css({pointerEvents: 'none'});
            $('.title-bar__control__icon.icon-close').parent('div').css({pointerEvents: 'auto'});
            $('.title-bar-sidebar-overlay').hide();
            $('.wrapper').html('<div style="margin: auto; display: block; text-align: center"><h1 style="font-size: 400%; font-weight: 200">Prepros Crashed :( </h1><p>I know you are feeling bad, I am also feeling the same :( <br> Please contact ' + Prepros.urls.emali + ' with error log file. <br>' + errorLogPath + '</p></div>');
        };

        process.on('uncaughtException', handle);

        return handle;
    }
]);
