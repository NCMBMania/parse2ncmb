"use strict"

var Converter = module.exports = (function() {

    var ObjMapper = require('./objmapper');

    var keyMap = {
	createdAt: 'parseCreateAt'
	, updatedAt: 'parseUpdateAt'
	, objectId: 'parseObjectId'
    };

    function Converter(ncmb, type, name, objMapper, pointerQueue) {
	this.__proto__.ncmb = ncmb;
	this._type = type;
	this._name = name;
	this._objMapper = objMapper;
	this._pointerQueue = pointerQueue;
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
	    return this.convDummy(obj);
	    break;
	case 'join':
	    return this.convRelation(obj);
	    break;
	default:
	    return this.convObject(obj);
	    break;
	}
    };

    Converter.prototype.checkPointerType = function(obj) {
	return (obj.__type == 'Pointer');
    }

    Converter.prototype.objCopy = function(obj, map) {
	let attrs = {};
	Object.keys(obj).forEach(function(key) {
	    if (map[key] != undefined) {
		attrs[map[key]] = obj[key];
		return;
	    }

	    let val = obj[key];
	    let id = obj.objectId;
	    if (typeof val != 'object') {
		attrs[key] = val;
		return;
	    }

	    if (Array.isArray(val) && this.checkPointerType(val[0])) {
		this._pointerQueue.add(this._name, id, key, val);
	    } else if (this.checkPointerType(val)) {
		this._pointerQueue.add(this._name, id, key, val);
	    } else {
		attrs[key] = val;
	    }
	}, this);
	return attrs;
    };

    Converter.prototype.convInstallation = function(obj) {
	let map = keyMap;
	// add key depends on installations
	map['appName'] = 'applicationName';
	let attrs = this.objCopy(obj, map);

	let NCMBInstallationEx = require('./installation_ex');
	let installation = new NCMBInstallationEx(this.ncmb);
	let converter = this;

	return new Promise(function(resolve, reject) {
	    installation
		.register(attrs)
		.then(function() {
		    resolve(converter);
		})
		.catch(function(err) {
		    reject(err);
		});
	});
    }

    Converter.prototype.convUser = function(obj) {
	let klassName = this._name;
	let mapper = this._objMapper;

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
	let converter = this;

	return new Promise(function(resolve, reject) {
	    user.save()
	    .then(function(savedObj) {
		mapper.set(klassName,
			   savedObj.parseObjectId,
			   savedObj.objectId
			   );
		resolve(converter);
	    })
	    .catch(function(err) {
		reject(err);
	    });
	});
    }

    Converter.prototype.convObject = function(obj) {
	let attrs = this.objCopy(obj, keyMap);
	let klassName = this._name;
	let mapper = this._objMapper;

	let klass = this.ncmb.DataStore(klassName);
	let object = new klass(attrs);
	let converter = this;

	return new Promise(function(resolve, reject) {
	    object.save()
	    .then(function(savedObj) {
		mapper.set(klassName,
			   savedObj.parseObjectId,
			   savedObj.objectId
			   );
		resolve(converter);
	    })
	    .catch(function(err) {
		reject(err);
	    });
	});
    }

    Converter.prototype.convRelation = function(obj) {
	let names = this._name.split(':');
	let relname = names[0];
	let className = names[1];

	let mapper = this._objMapper;
	let ncmb = this.ncmb;
	let owningId = obj.owningId;
	let relatedId = obj.relatedId;
	let converter = this;

	return new Promise(function(resolve, reject) {
	    let p_own = ObjMapper.getNcmbObjByParseId(owningId, ncmb, mapper);
	    let p_rel = ObjMapper.getNcmbObjByParseId(relatedId, ncmb, mapper);
	    Promise.all([p_own, p_rel])
		.then(function(values) {
		    let targetObj = values[0];
		    let relObj = values[1];

		    let relation = new ncmb.Relation();
		    relation.add(relObj);
		    targetObj.set(relname, relation);
		    targetObj.update()
			.then(function(obj) {
			    resolve();
			})
			.catch(function(err) {
			    reject(err);
			});
		})
		.catch(function(err) {
		    reject(err);
		});
	});
    }

    Converter.prototype.convDummy = function(obj) {
	let converter = this;
	return new Promise(function(resolve, reject) {
	    resolve(converter);
	});
    }

    return Converter;
})();
