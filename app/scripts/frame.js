/*jshint browser: true, node: true*/
/*global $, nw, prepros*/


$(document).on('loadFrame', function () {

    'use strict';

    var nw = {
        gui : require('nw.gui'),
        window: require('nw.gui').Window.get()
    };

    //Show window
    nw.window.show();

    //Prevent unhandled file drops
    $(window).on('dragenter dragexit dragover drop', function(e){

        e.preventDefault();

    });

    //Prevent backspace navigation
    $(document).keydown(function (e) {
        var allowed_elements = $(document.activeElement)
            .is('input[type=text]:focus, input[type=number]:focus, input[type=password]:focus, textarea:focus');
        if (e.keyCode === 8 && !allowed_elements) {
            e.preventDefault();
        }
    });

    //Title bar controls
    $('.title-bar .controls .close-app').on('click', function () {
        nw.window.close();
    });

    $('.title-bar .controls .love').on('click', function () {
        require('child_process').spawn('explorer', ['http://alphapixels.com/prepros#love'], {detached: true})
    });

    $('.title-bar .controls .minimize-app').on('click', function () {
        nw.window.minimize();
    });

    $('.title-bar .controls .to-tray').on('click', function () {

        nw.window.hide();
    });

    //Tray icon
    var tray_icon = new nw.gui.Tray({
        title: 'Prepros App',
        icon: 'app/assets/img/icons/16.png' //Relative to package.json file
    });

    //Tray Icon Right Click Menu
    var tray_menu = new nw.gui.Menu();

    tray_menu.append(new nw.gui.MenuItem({
        label: 'Show Window',
        click: function () {
            nw.window.show();
            nw.window.focus();
        }
    }));

    tray_menu.append(new nw.gui.MenuItem({
        label: 'Hide Window',
        click: function () {
            nw.window.hide();
        }
    }));

    tray_menu.append(new nw.gui.MenuItem({
        label: 'Exit App',
        click: function () {
            nw.window.close();
        }
    }));

    tray_icon.menu = tray_menu;
    tray_icon.on('click', function () {
        nw.window.show();
        nw.window.focus();
    });


    nw.window.on('close', function () {
        tray_icon.remove();
        tray_icon = null;
        this.close(true);
    });

});
