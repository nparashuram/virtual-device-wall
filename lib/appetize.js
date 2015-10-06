var path = require('path');
var fs = require('fs');
var glob = require('glob');
var Q = require('q');
var request = require('request');
var archiver = require('archiver');

var debug = require('debug')('vw:appetize');

function appetize(opts) {
    var token = opts.token;
    var server = opts.server;
    var siteDir = opts.projectRoot;

    var privateKeyFile = '.privateKey.json';

    function getPrivateKeys() {
        try {
            var result = JSON.parse(fs.readFileSync(privateKeyFile, 'utf-8'));
            result['android'] = result['android'] || {};
            result['ios'] = result['ios'] || {};
            return result;
        } catch (e) {
            return {
                android: {},
                ios: {}
            }
        }
    }

    function setPrivateKey(platform, data) {
        console.log('Writing private key for %s. Keep this file safe for future updates to this app', platform);
        var val = getPrivateKeys();
        val[platform] = typeof data === 'string' ? JSON.parse(data) : data;
        fs.writeFileSync(privateKeyFile, JSON.stringify(val));
    }

    function upload(platform) {
        return Q.Promise(function(resolve, reject, notify) {
            var file = server + platform;
            debug('Uploading %s app from %s', platform, file);
            request.post({
                url: 'https://api.appetize.io/v1/app/update',
                json: {
                    token: token,
                    url: file,
                    platform: platform,
                    privateKey: getPrivateKeys()[platform].privateKey
                }
            }, function(err, response, body) {
                if (err || (response.status < 200 || response.status > 299)) {
                    debug('Error uploading file', err || body);
                    reject(err || body);
                } else {

                    setPrivateKey(platform, body);
                    resolve(body);
                }
            });
        });
    }

    function android() {
        var cwd = 'platforms/android/build/outputs/apk';
        var files = glob.sync('**/*.apk', {
            cwd: cwd,
            ignore: '*unaligned.apk',
        }).map(function(filename) {
            return path.join(cwd, filename);
        });
        if (files.length === 0) {
            return;
        }
        debug('Copying APK file %s to output', files[0]);
        var output = path.join(siteDir, 'bin/android');
        fs.createReadStream(files[0]).pipe(fs.createWriteStream(output));
        return upload('android');
    }

    function ios() {
        return Q.Promise(function(resolve, reject, notify) {
            var cwd = 'platforms/ios/build/emulator';
            var files = glob.sync('**/*.app', {
                cwd: cwd,
            }).map(function(filename) {
                return path.join(cwd, filename);
            });
            if (files.length === 0) {
                reject('No .app file found');
                return;
            }
            debug('Zipping iOS App file from ', files[0]);
            var output = fs.createWriteStream(path.join(siteDir, 'bin/ios'));
            output.on('close', resolve);
            output.on('error', reject);

            var archive = archiver.create('zip', {});
            archive.pipe(output);
            archive.directory(files[0]);
            archive.finalize();
        }).then(function() {
            return upload('ios');
        });
    }


    var dir = path.join(siteDir, 'bin');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    return Q().then(function() {
        return android();
    }).then(function() {
        return ios();
    }).then(function() {
        return getPrivateKeys();
    })
};

module.exports = appetize;
