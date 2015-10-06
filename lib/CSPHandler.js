var cheerio = require('cheerio');
var fs = require('fs');

module.exports = function(webPage) {
    var TAG = 'meta[http-equiv=Content-Security-Policy]';

    var pageContent = fs.readFileSync(webPage, 'utf-8');
    
    var $ = cheerio.load(pageContent);
}
