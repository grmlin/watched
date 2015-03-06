var helper = require('../util/helper');

var DomQuery = {
	init: function (strategy) {
		this._query = strategy;
		this._old = [];
	},

	old: function () {
		return helper.arrayClone(this._old);
	},

	current: function () {
		this._old = this._query();
		return helper.arrayClone(this._old);
	}
};

module.exports = DomQuery;