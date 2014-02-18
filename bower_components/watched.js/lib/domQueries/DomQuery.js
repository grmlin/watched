var DomQuery = function (strategy) {
	this._query = strategy;
	this._old = [];
};

Object.defineProperties(DomQuery.prototype, {
	old: {
		value: function () {
			return arrayClone(this._old);
		}
	},
	current: {
		value: function () {
			this._old = this._query();
			return arrayClone(this._old);
		}
	}
});