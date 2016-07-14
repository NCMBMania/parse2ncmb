#!/usr/bin/env node
// parse2ncmb.js
(function(global) {
    "use strict";

    var Configfile = require('config')
      , fs = require('fs')
      , globule = require('globule')
      , JSONStream = require('JSONStream')
      , NCMB = require('ncmb')
      , program = require('commander')
      , Converter = require('./lib/converter')
    ;

    // handling command-line
    program.version('0.0.1')
	.usage('[options] <directory>')
	.parse(process.argv);

    if (!program.args.length) {
	program.help();
	return;
    }
    let targetDir = program.args[0];
    // trim tailing '/'
    if (targetDir[targetDir.length - 1] == '/') {
	targetDir = targetDir.slice(0, -1);
    }
    let files = globule.find(targetDir + '/*');

    // initialize NCMB
    let app_key = Configfile.config.app_key;
    let client_key = Configfile.config.client_key;
    var ncmb = new NCMB(app_key, client_key);

    var converter = new Converter(ncmb, 'installation');

    let file = 'export/_Installation.json';

    fs.createReadStream(file)
	.pipe(JSONStream.parse('results.*'))
	.on('data', function(data) {
	    converter.convert(data);
	    console.log('***');
	})
    ;

})((this || 0).self || global);
