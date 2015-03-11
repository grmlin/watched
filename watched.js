var DomElement = require('./src/DomElement');
/**
 * @module watched
 */

/**
 * Creates a `LiveNodeList` directly or a decorated `HTMLElement` as `DomElement` to get lists with
 * different queries by yourself.
 *
 * Use a selector to get a `LiveNodeList` or an `HTMLElement` for complete control
 *
 *
 * @example
 * var foos = watched('.foo'); // LiveNodeList
 * var foos = watched(document).querySelectorAll('.foo'); // DomElement
 *
 *
 * @param {String|HTMLElement} element A selector string to use with `querySelectorAll` on the `document` or a dom
 * element
 * @returns {module:LiveNodeList~LiveNodeList|module:DomElement~DomElement}
 */
module.exports = function (element) {
	if (this instanceof module.exports) {
		throw new Error('watched is a factory function, not a constructor. Don\'t use the new keyword with it');
	}

	// a string will be used as a querySelectorAll shortcut on the document element
	if (typeof element === 'string') {
		return DomElement(document).querySelectorAll(element);
	} else {
		return DomElement(element);
	}
};