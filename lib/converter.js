"use strict"

var Converter = module.exports = (function() {

    function Converter(ncmb, type) {
	this.__proto__.ncmb = ncmb;
	this._type = type;
    }

    Converter.prototype.convert = function(obj) {
	let map = {
	    appName: 'applicationName'
	    , createdAt: 'parseCreateAt'
	    , updatedAt: 'parseUpdateAt'
	    , objectId: 'parseObjectId'
	};
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
	installation.register(attrs)
	    .catch(function(err) {
		console.log(err);
	    });
    }

    return Converter;
})();
