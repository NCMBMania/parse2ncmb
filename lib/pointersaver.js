"use strict"

var PointerSaver = module.exports = (function() {

    var ObjMapper = require('./objmapper');

    function PointerSaver(ncmb, objMapper) {
	this._ncmb = ncmb;
	this._objMapper = objMapper;
    }

    PointerSaver.prototype.retrieve = function(queue) {
	let parseId = queue.objectId;
	let className = queue.className;
	let attrName = queue.attrName;
	let data = queue.data;

	let obj_proms = [];

	// get target ncmbId
	obj_proms.push(
	    ObjMapper.getNcmbObjByParseId(parseId,
					  this._ncmb, this._objMapper)
	    );
	// get pointer's ncmbId
	if (Array.isArray(data)) {
	    data.forEach(function(pointer) {
		obj_proms.push(
		    ObjMapper.getNcmbObjByParseId(pointer.objectId,
						  this._ncmb,
						  this._objMapper)
		);
	    }, this);
	} else {
	    obj_proms.push(
		ObjMapper.getNcmbObjByParseId(data.objectId,
					      this._ncmb,
					      this._objMapper)
	    );
	}
	Promise.all(obj_proms)
	    .then(function(results) {
		let targetObj = results[0];
		results.splice(0, 1);

		results.forEach(function(obj) {
		    // if empty object, skip it
		    if (Object.keys(obj).length === 0) {
			return;
		    }
		    targetObj.set(attrName, obj)
		});

		targetObj
		    .update()
		    .then(function(result) {
			// success
		    })
		    .catch(function(err) {
			throw err;
		    });
	    })
	    .catch(function(err) {
		console.error(err);
	    });
    }

    return PointerSaver;
})();

