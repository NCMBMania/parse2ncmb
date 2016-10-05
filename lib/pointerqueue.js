"use strict"

var PointerQueue = module.exports = (function() {

    let Datastore = require('nedb');

    function PointerQueue() {
	this.db = null;
    }

    PointerQueue.prototype.getDb = function() {
	if (this.db == undefined) {
	    let prefix = 'db/';
	    let file = prefix + 'pointerqueue.db';
	    this.db = new Datastore({
		filename: file,
		autoload: true});
	}
	return this.db;
    };

    PointerQueue.prototype.reset = function() {
	let db = this.getDb();
	db.remove({}, {multi: true}, function(err, numRemoved) {
	    if (err) {
		console.log(err);
		throw err;
	    }
	});
    };

    PointerQueue.prototype.add = function(className, objectId,
					  attrName, data) {
	let db = this.getDb();
	let store = {
	    className: className
	    , objectId: objectId
	    , attrName: attrName
	    , data: data
	};
	db.insert(store, function(err, newDoc) {
	    if (err) {
		console.error(err);
		throw err;
	    }
	});
    };

    return PointerQueue;
})();

