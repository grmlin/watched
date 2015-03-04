var INDEX_OF_FAIL = -1;

module.exports = {
	isInvalidDomElement : function (el) {
		return AVAILABLE_QUERIES.some(function (query) {
			return typeof el[query] !== 'function';
		});
	},
	nodeListToArray : function (nodeList) {
		return Array.prototype.slice.call(nodeList)
	},
	arrayContains : function (element, list) {
		return list.indexOf(element) !== INDEX_OF_FAIL;
	},
	arrayClone : function (arr) {
		return arr.slice(0);
	},
	debounce : function (a, b, c) {
		var d;
		return function () {
			var e = this, f = arguments;
			clearTimeout(d), d = setTimeout(function () {d = null, c || a.apply(e, f)}, b), c && !d && a.apply(e, f);
		}
	}
};