module.exports = function(context) {
    if (context.opts.options.indexOf('--live-reload') === -1) {
        return;
    }

    var server = 'TODO';

    var fs = require('fs');
    var path = require('path');
    var url = require('url');

    var cheerio = require('cheerio');
    var Policy = require('csp-parse');

    var et = context.requireCordovaModule('elementtree');
    var Q = context.requireCordovaModule('q');
    var glob = context.requireCordovaModule('glob')

    /**
     * Updates config.xml files of a Cordova project to make the start page of the cordova app
     * specific in <content src=''/> tag to a web page that is hosted using browser-sync
     **/
    function setStartPage(hostedPage, filename) {
        var configXml = new et.ElementTree(et.XML(fs.readFileSync(filename, "utf-8").replace(/^\uFEFF/, "")));
        var contentTag = configXml.find('content[@src]');
        if (contentTag) {
            contentTag.attrib.src = hostedPage;
        }
        // Also add allow nav in case of 
        var allowNavTag = et.SubElement(configXml.find('.'), 'allow-navigation');
        allowNavTag.set('href', '*');
        fs.writeFileSync(filename, configXml.write({
            indent: 4
        }), "utf-8");
        debug('Changing config file', configXML, hostedPage);
        return filename;
    }

    /**
     * Updates the given HTML file's CSP to include ws: and unsafe-inline script tags. 
     * These tags are required by browser-sync
     **/
    function addCSP(htmlFile) {
        debug('Updating CSP for ', htmlFile);
        var pageContent = fs.readFileSync(htmlFile, 'utf-8');

        var $ = cheerio.load(pageContent);
        var cspTag = $('meta[http-equiv=Content-Security-Policy]');
        var policy = new Policy(cspTag.attr('content'));
        policy.add('script-src', 'ws:');
        policy.add('script-src', 'unsafe-inline');
        cspTag.attr('content', policy.toString());

        debug('New CSP is ', policy.toString());
        fs.writeFileSync(htmlFile, $.html());
        return htmlFile;
    }

    var WWW_FOLDER = {
        android: '/platforms/android/assets/www/index.html',
        ios: '/platforms/ios/www/index.html'
    };

    var CONFIG_LOCATION = {
        android: 'platforms/android/res',
        ios: 'platforms/ios'
    }

    ['android', 'ios'].map(function(platform) {
        setStartPage(url.resolve(server, WWW_FOLDER[platform]), path.join(context.opts.projectRoot, CONFIG_LOCATION[platform]));
        addCSP(path.join(context.opts.projectRoot, WWW_FOLDER[platform]));
    });

};
