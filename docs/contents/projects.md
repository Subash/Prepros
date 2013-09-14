---
title: Managing projects
template: index.jade
---

Project is the collection of all your preprocessing files. It can be just your scss, less folder or the project you are working on. Your projects are listed on the left part of the Prepros window

### Adding Project
Adding a new project to Prepros is as easy as pie. There are three ways to add project in Prepros.

__1. Drag &amp; Drop__

This is the easiest way to add project to Project. Just drag and drop your project folder to Prepros window and it will scan through all of your files in your project folder and add pre-process(able) files to watch list.

If you drag and drop a file instead of the folder, The parent folder of the file will be added to project.

__2. Using [ + ] button.__

You can add new project to Prepros by clicking the plus icon on the title bar of app window.

![Using plus icon to add new project](img/projects/plus-icon.jpg)

<div class="alert alert-info">You can also hit `CTRL+N` to add new project</div>

###Project Toolbar

When You select a project on Prepros a toolbar appears next to the `plus` icon. You can use the toolbar to manage your projects options.

![Option Toolbar](img/projects/toolbar.jpg)

__About icons (in the order of image above)__

* Refresh project files
* Project options
* [Optimize Images](image-optimization.html)
* Open [project live url](live-refresh.html)
* Remove project
* Upload With FTP

<div class="alert alert-info">You must refresh project after adding new file to project folder or importing one file from another file</div>

### Project Options
There are many options availabe to manage your projects. You can open options window by clicking the options button on the project toolbar.

![Project Options](img/projects/options.jpg)

Options window contain the options whch you can use to manage your project options. There are three tabs on project options window.

__1. General__
General tab contains the setting to change your project name and option to enable/disable [live refresh server](live-refresh.html) and use custom server for live refresh.

__2. Folders__
Folders tab contains options to set your default css, js and html folders.
You can also change default options from [options window](config.html) before adding new project.

__3. Filters__
You can exclude certain files from project by adding filter patterns in comma seperated list. You can also add global filters from [options window](config.html).
<div class="alert alert-info">Don't forget to refresh project after editing filters.</div>


<div class="alert alert-info">You can double click project name to open project folder in explorer.</div>

<h3 id="json">Team Collaboration With Prepros.json</h1>

`pepros.json` is a file that stores the settings and file/project information. The file is stored on the root of the project folder. When you remove and re-add the project to Prepros the settings on the `prepros.json` file are read and the settings on file are applied to the files on project. This file can be easily shared to share same settings across teams.


#### Creating Prepro.json File

To create `prepros.json` config file just right click on the project and click on `Create Config File` option.

![Creating Prepros.json File](img/projects/json.jpg)

This will create a new `prepros.json` config file and Prepros will update this file whenever the settings are changed from UI.


<h3 id="ftp">FTP Deployment</h1>

You can easily deploy your project with ftp. Go to FTP tab project options and enter ftp details. Prepros ignores preprocessor files by default. All files can be uploaded or only the edited or new files can be uploaded.

![](img/projects/ftp.jpg)