var Q = require('q');
var virtualWall = require('.');

// Steps to start Virtual Device Wall
var wallUrl;
Q().then(function() {
    return virtualWall.addHook('config.xml'); // Step 1: Add after prepare hook so that start page is modified
}).then(function() {
    return virtualWall.startBrowserSyncServer(); // Step 2: Start browser-sync server
}).then(function(server) {
    wallUrl = server;
    return virtualWall.buildCordovaApp(wallUrl); // Step 3: Run cordova run --live-reload=external server so that the apk/ipa are built
}).then(function() {
    return virtualWall.uploadToAppetize(); // Step 4: Upload apk/ipa to Appetize servers
}).then(function() {
    console.log('You can start your device wall at http://%s/wall', wallUrl);
    console.log('Keep this server running ');
    console.log('You can also modify files in www to see changes on all devices');
})
