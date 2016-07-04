"use strict"

var Converter = module.exports = (function() {

    function Converter(ncmb, type) {
	this.__proto__.ncmb = ncmb;
	this._type = type;
    }

    Converter.prototype.convert = function(obj) {
	let map = {
	    appName: 'applicationName'
	    , appVersion: 'appVersion'
	    , badge: 'badge'
	    , channels: 'channels'
	    , deviceToken: 'deviceToken'
	    , deviceType: 'deviceType'
	    , timeZone: 'timeZone'
	    , createdAt: 'createDate'
	    , updatedAt: 'updateDate'
	    , objectId: 'parseObjectId'
	};
	let Installation = this.ncmb.Installation;
	let attrs = {};
	
	Object.keys(obj).forEach(function(key) {
	    if (map[key] == undefined) {
		return;
	    }
	    attrs[map[key]] = obj[key];
	});
	let installation = new Installation(attrs);
	installation.update()
	    .catch(function(err) {
		console.log(err);
	    });
    }

    return Converter;
})();
