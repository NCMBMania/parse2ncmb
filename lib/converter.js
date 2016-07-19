"use strict"

var Converter = module.exports = (function() {

    var keyMap = {
	createdAt: 'parseCreateAt'
	, updatedAt: 'parseUpdateAt'
	, objectId: 'parseObjectId'
    };

    function Converter(ncmb, type) {
	this.__proto__.ncmb = ncmb;
	this._type = type;
    }

    Converter.prototype.convert = function(obj) {
	switch (this._type) {
	case 'installation':
	    return this.convInstallation(obj);
	    break;
	default:
	    return this.convObject(obj);
	    break;
	}
    };

    Converter.prototype.convInstallation = function(obj) {
	let map = keyMap;
	// add key depends on installations
	map['appName'] = 'applicationName';

	let NCMBInstallationEx = require('./installation_ex');
	let installation = new NCMBInstallationEx(this.ncmb);
	let attrs = {};

	Object.keys(obj).forEach(function(key) {
	    if (map[key] == undefined) {
		attrs[key] = obj[key];
	    } else {
		attrs[map[key]] = obj[key];
	    }
	});

	return new Promise(function(resolve, reject) {
	    installation
		.register(attrs)
		.then(function() {
		    resolve();
		})
		.catch(function(err) {
		    reject(err);
		});
	});
    }

    Converter.prototype.convObject = function(obj) {
	return new Promise(function(resolve, reject) {
	    resolve();
	});
    }

    return Converter;
})();
