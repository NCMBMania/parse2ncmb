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
	    type = 'join';
	    name = file;
	} else if (typemap[file] !== undefined) {
	    type = typemap[file];
	    name = '';
	} else {
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

    var fileInfos = [];
    files.forEach(function(path) {
	let info = getPathInfo(path);
	if (info.type !== null) {
	    fileInfos.push(info);
	}
    });

    // sort for 'join' type will be end of array
    fileInfos.sort(function(a, b) {
	if (a.type == 'join') {
	    if (b.type == 'join') {
		return a.path - b.path;
	    } else {
		return 1;
	    }
	} else {
	    if (b.type == 'join') {
		return -1;
	    } else {
		return a.path - b.path;
	    }
	}
    });

    // initialize NCMB
    let app_key = Configfile.config.app_key;
    let client_key = Configfile.config.client_key;
    var ncmb = new NCMB(app_key, client_key);

    var Parallel = throat(Promise)(concurrency);

    fileInfos.forEach(function(info) {
	var converter = new Converter(ncmb, info.type, info.name);

	fs.createReadStream(info.path)
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
