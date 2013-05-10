/*jshint browser: true, node: true*/
/*global prepros, $, _, Mousetrap */

//Directive for log element
prepros.directive('logElement', function(){

    return {
        restrict: 'A',
        link: function(scope, element){

            //Push element to global so the notification can trigger click event to open log window
            global.logElement = element;

        }
    }


});