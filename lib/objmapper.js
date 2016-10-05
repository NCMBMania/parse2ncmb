"use strict"

var ObjMapper = module.exports = (function() {

    let Datastore = require('nedb');

    function ObjMapper() {
	this.db = null;
    }

    ObjMapper.prototype.getDb = function() {
	if (this.db == undefined) {
	    let prefix = 'db/';
	    let file = prefix + 'parse2ncmb.db';
	    this.db = new Datastore({
		filename: file,
		autoload: true});
	}
	return this.db;
    };

    ObjMapper.prototype.set = function(name, parseId, ncmbId) {
	let db = this.getDb();
	let data = {
	    name: name
	    , parseId: parseId
	    , ncmbId: ncmbId
	};
	db.insert(data, function(err, newDoc) {
	    if (err) {
		console.log(err);
		throw err;
	    }
	});
    };

    ObjMapper.prototype.reset = function() {
	let db = this.getDb();
	db.remove({}, {multi: true}, function(err, numRemoved) {
	    if (err) {
		console.log(err);
		throw err;
	    }
	});
    };

    ObjMapper.prototype.findByParse = function(parseId) {
	let db = this.getDb();

	return new Promise(function(resolve, reject) {
	    db.find({parseId: parseId}, function(err, docs) {
		if (err) {
		    reject(err);
		} else {
		    resolve(docs[0]);
		}
	    });
	});
    };

    ObjMapper.prototype.ensureIndex = function() {
	let db = this.getDb();
	db.ensureIndex({fieldName: 'parseId'}, function(err) {
	    if (err) {
		throw err;
	    }
	});
	db.ensureIndex({fieldName: 'ncmbId'}, function(err) {
	    if (err) {
		throw err;
	    }
	});
    };

    return ObjMapper;
})();


