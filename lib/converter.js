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
	case 'user':
	    return this.convUser(obj);
	    break;
	case 'role':
	case 'product':
	case 'join_roles':
	case 'join_users':
	    return this.convDummy(obj);
	    break;
	default:
	    return this.convObject(obj);
	    break;
	}
    };

    Converter.prototype.objCopy = function(obj, map) {
	let attrs = {};
	Object.keys(obj).forEach(function(key) {
	    if (map[key] == undefined) {
		attrs[key] = obj[key];
	    } else {
		attrs[map[key]] = obj[key];
	    }
	});
	return attrs;
    };

    Converter.prototype.convInstallation = function(obj) {
	let map = keyMap;
	// add key depends on installations
	map['appName'] = 'applicationName';
	let attrs = this.objCopy(obj, map);

	let NCMBInstallationEx = require('./installation_ex');
	let installation = new NCMBInstallationEx(this.ncmb);

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

    Converter.prototype.convUser = function(obj) {
	let map = keyMap;
	// add keys depends on user
	map['username'] = 'userName';
	map['email'] = 'mailAddress';
	map['emailVerified'] = 'parseEmailVerified';
	map['sessionToken'] = 'parseSessionToken';
	let attrs = this.objCopy(obj, map);

	// override password as dummy
	attrs['password'] = 'ncmb_dummy_password';

	let user = new this.ncmb.User(attrs);

	return new Promise(function(resolve, reject) {
	    user.save()
	    .then(function() {
		resolve();
	    })
	    .catch(function(err) {
		reject(err);
	    });
	});
    }

    Converter.prototype.convObject = function(obj) {
	let attrs = this.objCopy(obj, keyMap);

	let klass = this.ncmb.DataStore(this._name);
	let object = new klass(attrs);
	return new Promise(function(resolve, reject) {
	    object.save()
	    .then(function() {
		resolve();
	    })
	    .catch(function(err) {
		reject(err);
	    });
	});
    }

    Converter.prototype.convDummy = function(obj) {
	return new Promise(function(resolve, reject) {
	    resolve();
	});
    }

    return Converter;
})();
