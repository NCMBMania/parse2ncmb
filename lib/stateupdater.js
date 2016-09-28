"use strict"

var StateUpdater = module.exports = (function() {

    const logUpdate = require('log-update');
    const frames = ['-', '\\', '|', '/'];

    var i = 0; // frame counter

    function StateUpdater(startMsg, doneMsg) {
	this._startMsg = startMsg;
	this._doneMsg = doneMsg;
    }

    StateUpdater.prototype.tick = function() {
        const frame = frames[i = ++i % frames.length];
        logUpdate(this._startMsg + `${frame}`);
    }

    StateUpdater.prototype.done = function() {
	logUpdate(this._startMsg + this._doneMsg);
	logUpdate.done();
    }

    return StateUpdater;
})();
