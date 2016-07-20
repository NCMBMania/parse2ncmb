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
      , throat = require('throat')
    ;

    // handling command-line
    program.version('0.0.1')
	.usage('[options] <directory>')
	.option('-c, --concurrency <number>', 'Set parallel concurrency',
		parseInt)
	.parse(process.argv);

    if (!program.args.length) {
	program.help();
	return;
    }
    var concurrency = 3; // default
    if (program.concurrency != undefined) {
	concurrency = program.concurrency;
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

    var Parallel = throat(Promise)(concurrency);

    var typemap = {
	'_Installation.json': 'installation'
	, '_Join:roles:_Role.json': 'join_roles'
	, '_Join:users:_Role.json': 'join_users'
	, '_Product.json': 'product'
	, '_Role.json': 'role'
	, '_User.json': 'user'
    }

    files.forEach(function(path) {
	let file = path.replace(/.*\//, '');
	let type, name;
	if (typemap[file] !== undefined) {
	    type = typemap[file];
	    name = '';
	} else {
	    type = 'object';
	    let match = file.match(/(.*)\.json$/);
	    if (match === null) {
		return;
	    }
	    name = match[1];
	}
	var converter = new Converter(ncmb, type, name);

	fs.createReadStream(path)
	    .pipe(JSONStream.parse('results.*'))
	    .on('data', function(data) {
		Parallel(function() {
		    return converter.convert(data)
		})
		.then(function(results) {
		    // something on success?
		})
		.catch(function(err) {
		    console.log(err);
		})
		;
	    });
    });
    return;

})((this || 0).self || global);
