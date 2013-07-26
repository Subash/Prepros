---
title: Live browser refresh
template: index.jade
---

Prepros can live refresh your browser whenever a change is made to your file.

Live refresh works in Firefox, Chrome, Opera and IE10 if you are using built in http server but to use custom server or file url you have to install browser extension.

Prepros uses websockets for communication so your browser must it for the live refresh to work.

You have to [install](installing.html) browser extension for the live refresh to work with custom server.

If you open file directly in the browser from file system ~~live refresh won't work~~ (It works from version 2.0 with browser extension). You have to click on the `globe` icon on the project toolbar to open live url with built in http server. You can also hit `CTRL+L` to open the live url of the selected project.

![Click to open Live url](img/live-refresh/open-live-url.jpg)


## Using custom server

If you are using custom setup like apache or any other server you have to change the live refresh url from the [projects options panel](projects.html).

Open projects options panel by clicking the cog icon in the project toolbar and go to general tab. Check the use custom server checkbox and enter your custom url you want to refresh. Note: Don't forget the `http` or `https` protocol before the url.

![Custom Server](img/live-refresh/custom-server.jpg)

<div class="alert alert-info">Please enable `allow access to file url` option for Prepros chrome extension from chrome extensions page.</div>