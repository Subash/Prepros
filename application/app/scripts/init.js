/**
 * Prepros
 * (c) Subash Pathak
 * subash@subash.me
 * License: MIT
 */


/*jshint browser: true, node: true*/
/*global $, Prepros, $LAB, angular*/

(function() {

  'use strict';

  var http = require('http');

  // Random enough  :)
  var port = 57369;

  //Try to create server
  var server = http.createServer(function(req, res) {

    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.end('Prepros App.');

    //Show and maximize window on request
    var nwWindow = require('nw.gui').Window.get();
    nwWindow.show();
    nwWindow.focus();

    if (req.url.toString().slice(1)) {

      Prepros.Window.emit('addProject', {
        path: decodeURIComponent(req.url.toString().slice(1))
      });

    }

  }).listen(port, '127.0.0.1', function() {

    //Load all scripts

    var controllers = [
      'MainCtrl',
      'TitleBarCtrl',
      'ProjectCtrl',
      'FilesCtrl',
      'AboutCtrl',
      'MultiDeviceCtrl',
      'AppOptionsCtrl'
    ];

    var services = [
      'projectsManager',
      'storage',
      'utils',
      'watcher',
      'compiler',
      'config',
      'liveServer',
      'notification',
      'projectsManager',
      'importsVisitor',
      'storage',
      'utils',
      'fileTypes',
      'update',
      'exceptionHandler',
      'pro',
      'log',
      'imageOptimization'
    ];

    var fileTypes = [
      'less',
      'sass',
      'stylus',
      'markdown',
      'coffee',
      'javascript',
      'jade',
      'haml',
      'slim',
      'livescript',
      'concat'
    ];

    var filters = [
      'interpolatePath',
      'prettyPath',
      'shortPath',
      'size'
    ];

    var directives = [
      'link-external',
      'tooltip',
      'popover',
      'drag-drop-project',
      'project-context-menu',
      'file-context-menu',
      'modal-on-click',
      'keyboard-shortcuts',
      'copy-selected-text',
      'image-context-menu',
      'ctrl-click'
    ];

    var scripts = [];

    if (!Prepros.DEBUG) {

      scripts.push('scripts/prepros.min.js');

    } else {

      //Angularjs App
      scripts.push('scripts/app.js');

      //Services
      services.forEach(function(service) {
        scripts.push('scripts/services/' + service + '.js');
      });

      //File types
      fileTypes.forEach(function(type) {
        scripts.push('scripts/services/fileTypes/' + type + '.js');
      });

      //Controllers
      controllers.forEach(function(controller) {
        scripts.push('scripts/controllers/' + controller + '.js');
      });

      //Filters
      filters.forEach(function(filter) {
        scripts.push('scripts/filters/' + filter + '.js');
      });

      //Directives
      directives.forEach(function(directive) {
        scripts.push('scripts/directives/' + directive + '.js');
      });

    }

    //Load scripts and bootstrap
    $LAB.setOptions({
      AlwaysPreserveOrder: true
    });

    $LAB.script(scripts).wait(function() {

      angular.bootstrap(document, ['prepros']);
      Prepros.Window.show(); //Show after the app is ready

    });

    var PreprosState = {};

    //Create a new new entry in localStorage
    if (localStorage.PreprosState) {
      PreprosState = JSON.parse(localStorage.PreprosState);
    }

    //Redirect to last state url
    if (PreprosState.url && !(

        PreprosState.url.indexOf('#/app-options/') >= 0 ||
        PreprosState.url.indexOf('#/log/') >= 0 ||
        PreprosState.url.indexOf('#/project-options/') >= 0)

    ) {

      window.location.hash = PreprosState.url;
    }

    //Window height
    if (PreprosState.height) {
      Prepros.Window.height = PreprosState.height;
    }

    //Window Width
    if (PreprosState.width) {
      Prepros.Window.width = PreprosState.width;
    }

    if (PreprosState.x) {
      Prepros.Window.x = PreprosState.x;
    }

    if (PreprosState.y) {
      Prepros.Window.y = PreprosState.y;
    }

    if (PreprosState.maximized) {
      Prepros.Window.maximize();
    }

    //Fix for nasty node-webkit bug; https://github.com/rogerwang/node-webkit/issues/1021
    if (Prepros.PLATFORM_WINDOWS && parseFloat(require('os').release(), 10) > 6.1) {
      Prepros.Window.setMaximumSize(screen.availWidth + 15, screen.availHeight + 15);
    }

    //Prevent unhandeled drag drops
    $(window).on('dragenter dragover drop', function(e) {
      e.preventDefault();
    });

    //Prevent unhandled middle clicks and ctrl+clicks
    $(window).on('click', function(e) {
      if (e.which === 2 || e.ctrlKey) {
        e.preventDefault();
      }
    });


    if (Prepros.PLATFORM_WINDOWS) {

      //Tray icon
      var trayOptions = {
        icon: 'app/assets/img/icons/16.png', //Relative to package.json file
        title: 'Prepros App'
      };

      var tray_icon = new Prepros.gui.Tray(trayOptions);

      //Tray Icon Right Click Menu
      var tray_menu = new Prepros.gui.Menu();

      tray_menu.append(new Prepros.gui.MenuItem({
        label: 'Show Window',
        click: function() {
          Prepros.Window.show();
          Prepros.Window.focus();
        }
      }));

      tray_menu.append(new Prepros.gui.MenuItem({
        label: 'Hide Window',
        click: function() {
          Prepros.Window.hide();
        }
      }));

      tray_menu.append(new Prepros.gui.MenuItem({
        label: 'Exit Prepros',
        click: function() {
          Prepros.Window.close();
        }
      }));

      tray_icon.menu = tray_menu;
      tray_icon.on('click', function() {
        Prepros.Window.show();
        Prepros.Window.focus();
      });

      //Push tray icon to global window to tell garbage collector that tray icon is not garbage
      Prepros._trayIcon = tray_icon;
    }

    //Save State Details on exit
    Prepros.Window.on('close', function() {
      Prepros.Window.hide();
      PreprosState.url = window.location.hash;
      PreprosState.height = Prepros.Window.height;
      PreprosState.width = Prepros.Window.width;
      PreprosState.x = Prepros.Window.x;
      PreprosState.y = Prepros.Window.y;
      PreprosState.maximized = false;
      if (Prepros.PLATFORM_WINDOWS && Prepros.Window.x <= 0 && Prepros.Window.height >= window.screen.availHeight) {
        PreprosState.maximized = true;
        Prepros.Window.unmaximize();
        PreprosState.height = Prepros.Window.height;
        PreprosState.width = Prepros.Window.width;
        PreprosState.x = Prepros.Window.x;
        PreprosState.y = Prepros.Window.y;

      }
      localStorage.PreprosState = JSON.stringify(PreprosState);
      Prepros.gui.App.closeAllWindows();
      this.close(true);
    });
  });

  //Error means another instance is running
  //So request the server to show previous instance
  server.on('error', function() {

    var getUrl = 'http://127.0.0.1:' + port;

    if (Prepros.gui.App.argv[0]) {

      getUrl += '/' + encodeURIComponent(Prepros.gui.App.argv[0]);
    }

    http.get(getUrl, function() {
      Prepros.Window.close(true);
    });
  });
})();
