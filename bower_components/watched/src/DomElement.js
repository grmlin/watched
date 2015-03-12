var helper = require('./util/helper'),
	constants = require('./util/constants'),
	LiveNodeList = require('./LiveNodeList'),
	QueryStrategyFactory = require('./domQueries/QueryStrategyFactory');


/**
 * @module watched/DomElement
 */




/**
 * Object used as prototype for new DomElement instances.
 * Should be used as a prototype for new `DomElement` instances
 *
 * @namespace module:watched/DomElement~DomElement
 */
var DomElement = {
	__name__: 'DomElement'
};

/**
 * Add all available queries to the DomElement's prototype
 */
constants.AVAILABLE_QUERIES.forEach(function (queryType) {
	DomElement[queryType] = function (selector) {
		// TODO tiny query factory, better do some error handling?
		var queryStrategy = QueryStrategyFactory.create(queryType, this.el, selector);

		return LiveNodeList(queryStrategy);
	};
});


/**
 * See [`querySelectorAll`](http://devdocs.io/dom/document.queryselectorall) for details.
 *
 * @function querySelectorAll
 * @memberof module:watched/DomElement~DomElement
 * @param {String} selector
 * @instance
 * @returns {module:watched/LiveNodeList~LiveNodeList}
 */

/**
 * See [`querySelector`](http://devdocs.io/dom/document.queryselector) for details. The returned object will be always
 * a `LiveNodeList`, not a single element as in the native `querySelector`.
 *
 * @function querySelector
 * @memberof module:watched/DomElement~DomElement
 * @param element
 * @instance
 * @returns {module:watched/LiveNodeList~LiveNodeList}
 */

/**
 * See [`getElementsByTagName`](http://devdocs.io/dom/element.getelementsbytagname) for details. Should be faster than
 * the query selectors, as **watched.js** uses the native live nodelist internally to get the elements you want.
 *
 * @function getElementsByTagName
 * @memberof module:watched/DomElement~DomElement
 * @param {String} selector
 * @instance
 * @returns {module:watched/LiveNodeList~LiveNodeList}
 */


/**
 * See [`getElementsByClassName`](http://devdocs.io/dom/document.getelementsbyclassname) for details. Should be faster
 * than the query selectors, as **watched.js** uses the native live nodelist internally to get the elements you want.
 *
 * @function getElementsByClassName
 * @memberof module:watched/DomElement~DomElement
 * @param {String} selector
 * @instance
 * @returns {module:watched/LiveNodeList~LiveNodeList}
 */


/**
 * factory method to create new `DomElement` instances
 *
 * @param {HTMLElement} element the HTMLElement used as root for all queries
 * @returns {module:watched/DomElement~DomElement}
 * @throws {Error|TypeError}
 * @example
 * var DomElement = require('./DomElement');
 * var domElement = DomElement(document);
 * var nodeList = domElement.querySelectorAll('.foo');
 */
module.exports = function(element){
	if (this instanceof module.exports) {
		throw new Error('The DomElement is a factory function, not a constructor. Don\'t use the new keyword with it');
	}
	if (helper.isInvalidDomElement(element)) {
		throw new TypeError('The element to watch has to be a HTMLElement! The type of the given element is ' + typeof element );
	}

	var domElement = Object.create(DomElement, {
		el : {
			value: element
		}
	});
	return domElement;
};