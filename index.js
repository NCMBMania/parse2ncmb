// index.js
(function(global) {
    "use strict";

    var Configfile = require('config')
      , fs = require('fs')
      , JSONStream = require('JSONStream')
      , NCMB = require('ncmb')
      , Converter = require('./lib/converter')
    ;

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
