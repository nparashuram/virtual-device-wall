var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var et = require('elementree');

var cordova = require('cordova-lib').cordova.raw;
/**
 * Adds a after_prepare hook so that the start page is modified when Cordova run is called
 **/
function addHook(filename) {
    var configFile = fs.readFileSync(filename, "utf-8").replace(/^\uFEFF/, "");
    // TODO - If config.xml does not exist, error asking if this is really a Cordova project
    var configXml = new et.ElementTree(et.XML(configFile));
    var subElement = et.SubElement;

    var hook = subElement(root, 'hook');
    hook.set('type', 'after_prepare');
    hook.set('src', path.join(__dirname + 'after_prepare.hook.js'));

    fs.writeFileSync(filename, configXml.write({
        indent: 4
    }), "utf-8"));
}

/**
 * Starts the browser-sync server at a specific URL, exposes the platform/www folders using a local tunnel identifier
 **/
function startBrowserSyncServer() {
    var browserSyncServer = require('./browserSyncServer');
    return browserSyncServer({
        onFileChange: function() {
            cordova.prepare()
        }
        routes: {
            '/platforms/android/assets/www': 'platforms/android/assets/www',
            '/platforms/ios/www/': 'platforms/ios/www'
            '/wall': path.join(__dirname, 'site')
        }
    });
}

function buildCordova(server) {
    return cordova.run({
        options: ['--release', '--live-reload=server']
    });
}

function uploadToAppetize() {

}

module.exports = {
    addHook: addHook,
    startBrowserSyncServer: startBrowserSyncServer,
    buildCordovaApp: buildCordovaApp,
    uploadToAppetize: uploadToAppetize
}
