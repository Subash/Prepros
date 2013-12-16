/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, Prepros*/

prepros.factory('pro', [

    'utils',

    function (utils) {

        'use strict';

        function showMessage() {

            var confirmMsg = utils.notifier.notify({
                message: "<h1 style='font-weight: 100'>That's a Prepros Pro Feature</h1>" +
                    "<p>The feature you're trying to access is a Prepros Pro feature. Please consider supporting the development to enjoy all the features.<br> Thanks :)</p>",
                type: "info",
                buttons: [
                    {'data-role': 'close', text: 'Close'},
                    {'data-role': 'ok', text: 'Buy Now'}
                ],
                destroy: true
            });

            confirmMsg.on('click:ok', function () {

                this.destroy();

                Prepros.gui.Shell.openExternal(Prepros.urls.love);
            });

            confirmMsg.on('click:close', 'destroy');
        }

        return {
            showMessage: showMessage
        };
    }
]);