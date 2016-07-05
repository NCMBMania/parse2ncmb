"use strict"

var NCMBInstallationEx = module.exports = (function() {

    var validKeys = [
	'applicationName'
	, 'appVersion'
	, 'badge'
	, 'channels'
	, 'deviceToken'
	, 'deviceType'
	, 'sdkVersion'
	, 'timeZone'
	, 'acl'
    ];

    function NCMBInstallationEx(ncmb) {
	this.__proto__.ncmb = ncmb;
	this.__proto__.className = '/installations';
    }

    NCMBInstallationEx.prototype.register = function(attrs, callback) {
	var ncmb = this.ncmb;
	var dataToPost = {};

	Object.keys(attrs).forEach(function(attr) {
	    if (validKeys.indexOf(attr) != -1) {
		dataToPost[attr] = attrs[attr];
	    }
	});

	return ncmb.request({
	    path: "/" + ncmb.version + this.className,
	    method: "POST",
	    data: dataToPost
	}).then(function(data){
	    var obj = null;
	    try {
		obj = JSON.parse(data);
	    } catch(err) {
		throw err;
	    }
	    if (callback) {
		return callback(null, this);
	    }
	    return this;
	}.bind(this)).catch(function(err){
	    if(callback) return callback(err, null);
	    throw err;
	});
    };

    return NCMBInstallationEx;
})();
