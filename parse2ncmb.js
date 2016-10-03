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
      , ObjMapper = require('./lib/objmapper')
      , throat = require('throat')
    ;

    // handling command-line
    program.version('0.0.1')
	.usage('[options] <directory>')
	.option('-c, --concurrency <number>', 'Set parallel concurrency',
		parseInt)
	.option('-p, --phase <number>', 'Specify phase number', parseInt)
	.option('-s, --silent', 'Silent mode')
	.parse(process.argv);

    if (!program.args.length) {
	program.help();
	return;
    }
    var concurrency = 3; // default
    if (program.concurrency != undefined) {
	concurrency = program.concurrency;
    }
    if (program.phase === undefined) {
	console.error('Phase number required');
	process.exit(1);
    }
    if (program.phase != 1 && program.phase != 2) {
	console.error('Invalid phase number');
	process.exit(1);
    }

    let targetDir = program.args[0];
    // trim tailing '/'
    if (targetDir[targetDir.length - 1] == '/') {
	targetDir = targetDir.slice(0, -1);
    }
    let files = globule.find(targetDir + '/*');

    let getPathInfo = function(path) {
	let typemap = {
	    '_Installation.json': 'installation'
	    , '_Product.json': 'product'
	    , '_Role.json': 'role'
	    , '_User.json': 'user'
	};
	let joinPrefix = '_Join:';
	let type = null;
	let name = null;

	let file = path.replace(/.*\//, '');

	if (file.substr(0, joinPrefix.length) === joinPrefix) {
	    // join type
	    type = 'join';
	    let match = file.match(/^_Join:(.*)\.json$/);
	    name = match[1];
	} else if (typemap[file] !== undefined) {
	    // preset types
	    type = typemap[file];
	    let match = file.match(/(.*)\.json$/);
	    name = match[1];
	} else {
	    // other
	    type = 'object';
	    let match = file.match(/(.*)\.json$/);
	    if (match === null) {
		type = null;
	    } else {
		name = match[1];
	    }
	}
	return {
	    path: path
	    , file: file
	    , type: type
	    , name: name
	};
    }

    var objFiles = [], relFiles = [];
    files.forEach(function(path) {
	let info = getPathInfo(path);
	if (info.type === null) {
	    return;
	}
	if (info.type == 'join') {
	    relFiles.push(info);
	} else {
	    objFiles.push(info);
	}
    });

    // initialize NCMB
    let app_key = Configfile.config.app_key;
    let client_key = Configfile.config.client_key;
    var ncmb = new NCMB(app_key, client_key);
    var objMapper = new ObjMapper;

    var Parallel = throat(Promise)(concurrency);

    let targetFiles = null;
    if (program.phase == 1) {
	// Phase 1: store objects
	targetFiles = objFiles;
	objMapper.reset();
    } else {
	// Phase 2: store relations and others
	targetFiles = relFiles;
	objMapper.ensureIndex();
    }

    targetFiles.forEach(function(info) {
	var converter = new Converter(ncmb, info.type, info.name, objMapper);

	fs.createReadStream(info.path)
	    .pipe(JSONStream.parse('results.*'))
	    .on('data', function(data) {
		Parallel(function() {
		    return converter.convert(data)
		})
		.catch(function(err) {
		    console.error(err);
		});
	    })
	    .on('end', function() {
		console.log(info.name + ' done.');
	    });

    });

})((this || 0).self || global);
