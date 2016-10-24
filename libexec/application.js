/**
 * 入口程序。
 *
 * @author    姚尧 <yaogaoyu@gmail.com>
 * @copyright © 2016 yaogd.com
 * @license   GPL-3.0+
 */

var $electron = require('electron'),
    $app = $electron.app,
    $win = $electron.BrowserWindow,
    $menu = $electron.Menu,
    $fs = require('fs'),
    $ = {
        $debug: '--debug' == process.argv[2]
    };

$.open = function(id, options) {
    var opts = {
            center: true,
            resizable: false,
            icon: 'file://' + __dirname + '/../image/icon.png',
            fullscreen: false,
            show: false
        },
        file = 'file://' + __dirname + '/../index.html',
        ii,
        self = this;
    id = '$' + id;
    for (ii in options) {
        if (options.hasOwnProperty(ii) && !opts.hasOwnProperty(ii)) {
            opts[ii] = options[ii];
        }
    }
    this[id] = new $win(opts);
    if ('darwin' != process.platform) {
        this[id].setMenu(null);
    }
    this[id].webContents.on('dom-ready', function () {
        self[id].show();
        if ($.$debug) {
            self[id].openDevTools();
        }
    });
    this[id].on('closed', function () {
        delete self[id];
    });
    // Open the DevTools.
    this[id].loadURL(file);
    this[id].webContents.openDevTools();
    return this[id];
};

$.menu = {};

$.menu.osx = function() {
    var menu = [
        {
            label: 'Application',
            submenu: [
                {
                    label: 'About Application',
                    selector: 'orderFrontStandardAboutPanel:'
                },
                {type: 'separator'},
                {
                    label: 'Services',
                    submenu: []
                },
                {type: 'separator'},
                {
                    label: 'Hide Application',
                    accelerator: 'Command+H',
                    selector: 'hide:'
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H',
                    selector: 'hideOtherApplications:'
                },
                {
                    label: 'Show All',
                    selector: 'unhideAllApplications:'
                },
                {type: 'separator'},
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    selector: 'terminate:'
                }
            ]
        },
        {
            label: 'Window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'Command+M',
                    selector: 'performMiniaturize:'
                },
                {type: 'separator'},
                {
                    label: 'Bring All to Front',
                    separator: 'arrangeInFront:'
                }
            ]
        },
        {
            label: 'Help',
            submenu: []
        }
    ];
    if ($.$debug) {
        menu.splice(2, 0, {
            label: 'Develop',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'Command+R',
                    click: function() {
                        $win.getFocusedWindow().reload();
                    }
                },
                {
                    label: 'Toggle DevTools',
                    accelerator: 'Alt+Command+I',
                    click: function() {
                        $win.getFocusedWindow().toggleDevTools();
                    }
                }
            ]
        });
    }
    return $menu.buildFromTemplate(menu);
};

// $electron.crashReporter.start();

$app.on('ready', function () {
    if ('darwin' == process.platform) {
        $menu.setApplicationMenu($.menu.osx());
    }
});

$app.on('ready', function () {
    $.open('main', {
        width: 1280,
        height: 720,
    });
});

$app.on('window-all-closed', function () {
    $app.quit();
});
