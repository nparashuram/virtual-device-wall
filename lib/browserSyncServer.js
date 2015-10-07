var browserSync = require('browser-sync');
var Q = require('q');
/**
 * Private function that adds the code snippet to deal with reloading
 * files when they are served from platform folders
 */
function monkeyPatch() {
    var script = function() {
        window.__karma__ = true;
        (function patch() {
            if (typeof window.__bs === 'undefined') {
                window.setTimeout(patch, 500);
            } else {
                var oldCanSync = window.__bs.prototype.canSync;
                window.__bs.prototype.canSync = function(data, optPath) {
                    data.url = window.location.pathname.substr(0, window.location.pathname.indexOf('/www')) + data.url.substr(data.url.indexOf('/www'))
                    return oldCanSync.apply(this, [data, optPath]);
                };
            }
        }());
    };
    return '<script>(' + script.toString() + '());</script>';
}

module.exports = function(opts) {
    var tunnelId = 'vdw' + (Math.random() + '').substr(2);
    var bs = require('browser-sync').create();
    return Q.deferred(function(resolve, reject, progress) {
        bs.watch(path.join(__dirname, 'www') + '/**/*.*', {}, function(event, files) {
            if (event !== 'change') {
                return;
            }
            if (typeof opts.onFileChange !== 'function' || opts.onFileChange(event, files) !== false) {
                bs.reload(files);
            }
        });

        bs.init({
            server: {
                baseDir: '.',
                routes: opts.routes
            },
            open: false,
            snippetOptions: {
                rule: {
                    match: /<\/body>/i,
                    fn: function(snippet, match) {
                        return monkeyPatch() + snippet + match;
                    }
                }
            },
            minify: false,
            tunnel: tunnelId
        }, function(err, bs) {
            var server = bs.options.getIn(['urls', 'external']);
            if (err) {
                reject(err);
            } else {
                resolve(server);
            }
        });
    });
};
