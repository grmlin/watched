var constants = require('./constants');

var INDEX_OF_FAIL = -1;

var hasMutationObserver = !!(window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver),
	NativeMutationObserver = hasMutationObserver ? MutationObserver || WebKitMutationObserver || MozMutationObserver : null;

/**
 * @external {MutationObserver}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 */

/**
 * @external {HTMLElement}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
 */

/**
 * @external {NodeList}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeList
 */

/**
 * Helper methods/properties used with watched.js
 *
 * @module watched/util/helper
 */

module.exports = {

	/**
	 * True, if a native mutation observer exists
	 * @type {boolean}
	 */
	hasMutationObserver: hasMutationObserver,

	/**
	 * Mutation observer object. `null`, if {@link watched/util/helper.hasMutationObserver} is false
	 * @type {MutationObserver}
	 */
	NativeMutationObserver: NativeMutationObserver,

	/**
	 * Checks if `el` isn't a valid dom element
	 * @param el
	 * @returns {boolean}
	 */
	isInvalidDomElement: function (el) {
		if (el) {
			return constants.AVAILABLE_QUERIES.some(function (query) {
				return typeof el[query] !== 'function';
			});
		} else {
			return true;
		}
	},

	/**
	 * Transforms a nodelist you get from native browser queries to an array
	 * @param {NodeList} nodeList
	 * @returns {Array.<HTMLElement>}
	 */
	nodeListToArray: function (nodeList) {
		return Array.prototype.slice.call(nodeList);
	},

	/**
	 * Checks if an array contains an element
	 * @param {Array} list
	 * @param {*} element
	 * @returns {boolean}
	 */
	arrayContains: function (list, element) {
		return list.indexOf(element) !== INDEX_OF_FAIL;
	},

	/**
	 * Clones an array
	 * @param {Array} arr
	 * @returns {Array}
	 */
	arrayClone: function (arr) {
		return arr.slice(0);
	},

	/**
	 * Debounce the call of a function
	 * @param {Function} a the function to debounce
	 * @param {Number} b the debounce delay
	 * @param {boolean} c immediate
	 * @returns {Function}
	 */
	debounce: function (a, b, c) {
		var d;
		return function () {
			var e = this, f = arguments;
			clearTimeout(d), d = setTimeout(function () {
				d = null, c || a.apply(e, f)
			}, b), c && !d && a.apply(e, f);
		}
	}
};