var path = require('path');
var url = require('url');
var fs = require('fs');

var plugin = require('cordova-plugin-browsersync');
var Q = require('q');
var ngrok = require('ngrok');

var appetize = require('./appetize');
var cordova = require('cordova/node_modules/cordova-lib').cordova;

var debug = require('debug');
var log = debug('vw:index');

var projectRoot = process.cwd();

module.exports = function(tokens, runOnDevice) {
    var patcher = new plugin.Patcher(projectRoot);
    var siteDir = path.resolve(__dirname, '../site');
    var platforms = ['android', 'ios'];
    var bs, proxiedUrl;

    log('Starting Virtual Device wall');

    cordova.on('warn', debug('vw:cordova:warn'));
    cordova.on('log', debug('vw:cordova:log'));
    cordova.on('verbose', debug('vw:cordova:verbose'));
    cordova.on('info', debug('vw:cordova:info'));
    cordova.on('after_prepare', function() {
        log('Prepare complete, now patching the Cordova project');
        patcher.patch({
            servers: {
                tunnel: proxiedUrl
            }
        });
    });

    function getBrowserSyncDefaults(defaults) {
        debug('Changing defaults');
        defaults.files.push({
            match: ['www/**/*.*'],
            fn: function(event, file) {
                if (event === 'change') {
                    cordova.raw.prepare().then(function() {
                        patcher.addCSP();
                        bs.reload();
                    });
                }
            }
        });
        defaults.logLevel = "error";
        defaults.server = {
            baseDir: ['bin'].concat(platforms.map(patcher.getWWWFolder.bind(patcher))),
            routes: {
                '/wall/bin': './bin',
            }
        }
        platforms.forEach(function(platform) {
            var www = patcher.getWWWFolder(platform);
            defaults.server.routes['/' + www.replace(/\\/g, '/')] = path.join(projectRoot, www);
        });
        return defaults;
    }

    return Q().then(function() {
        return Q.ninvoke(ngrok, 'connect', {
            port: 3000,
            authtoken: tokens.ngrok
        });
    }).then(function(url) {
        debug('External port on ', url);
        proxiedUrl = url;
    }).then(function() {
        var deferred = Q.defer();
        bs = plugin.browserSyncServer(getBrowserSyncDefaults, deferred.makeNodeResolver());
        return deferred.promise;
    }).then(function() {
        return cordova.raw[runOnDevice ? 'run' : 'build']();
    }).then(function() {
        console.log('\n\n\n\n\n====================\n\n');
    }).then(function() {
        return appetize({
            token: tokens.appetize,
            server: url.resolve(proxiedUrl, '/wall/bin/'),
            projectRoot: projectRoot
        });
    }).then(function(keys) {
        var html = fs.readFileSync(path.resolve(__dirname, '../site/index.html'), 'utf-8');
        html = html.replace('__KEYS__', JSON.stringify({
            android: keys.android.publicKey,
            ios: keys.ios.publicKey
        }));
        fs.writeFileSync('./bin/index.html', html);
        console.log('---- Open %s/wall/bin/index.html to view the virtual device wall ---', proxiedUrl);
    }).catch(function(err) {
        console.log('An error occured');
        console.log(err);
        debug('Some error occured, so closing all connections');
        if (bs) bs.exit();
        ngrok.disconnect();
    });
};
