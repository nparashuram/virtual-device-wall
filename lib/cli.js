#! /usr/bin/env node

var debug = require('debug')('vw:cli');
var program = require('commander');

var wall = require('./index');

program
    .version('0.0.1')
    .option('-d, --device', 'In addition to running on the wall, also run on a device')
    .option('-a, --appetize <appetize_token>', 'Appetize token that is required to upload the final app. Get one at https://appetize.io/api')
    .parse(process.argv);

debug('Starting comand line');
wall({
    appetize: program.appetize,
}, program.device).then(function() {
    console.log('Keep this process running ...');
}).catch(function(err) {
    console.log('===== ERROR =====');
    console.log(err);
}).done();
