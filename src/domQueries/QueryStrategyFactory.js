/**
 * @module domQueries/QueryStrategyFactory
 */


var constants = require('../util/constants'),
	helper = require('../util/helper'),
	/**
	 * @namespace module:domQueries/QueryStrategyFactory~Strategies
	 */
	Strategies = {};


var filterNodesInDocument = function (nodeArray) {
	return nodeArray.filter(function (node) {
		return document.documentElement.contains(node);
	});
};

/**
 * `element.querySelectorAll` strategy
 *
 * @function querySelectorAll
 * @memberof module:domQueries/QueryStrategyFactory~Strategies
 * @param {HTMLElement} element
 * @param {String} selector
 * @returns {Function} wrapped version of `element.querySelectorAll(selector)`
 */
Strategies[constants.queries.QUERY_SELECTOR_ALL] = function (element, selector) {
	return function () {
		var nodeList = element[constants.queries.QUERY_SELECTOR_ALL](selector);
		return filterNodesInDocument(helper.nodeListToArray(nodeList));
	};
};

/**
 * `element.querySelector` strategy
 *
 * @function querySelector
 * @memberof module:domQueries/QueryStrategyFactory~Strategies
 * @param {HTMLElement} element
 * @param {String} selector
 * @returns {Function} wrapped version of `element.querySelector(selector)`
 */
Strategies[constants.queries.QUERY_SELECTOR] = function (element, selector) {
	return function () {
		var node = element[constants.queries.QUERY_SELECTOR](selector);
		return filterNodesInDocument(node === null ? [] : [node]);
	};
};

/**
 * `element.getElementsByTagName` strategy
 *
 * @function getElementsByTagName
 * @memberof module:domQueries/QueryStrategyFactory~Strategies
 * @param {HTMLElement} element
 * @param {String} tagName
 * @returns {Function} wrapped version of `element.getElementsByTagName(tagName)`
 */
Strategies[constants.queries.GET_ELEMENTS_BY_TAG_NAME] = function (element, tagName) {
	// a live list, has to be called once, only
	var nodeList = element[constants.queries.GET_ELEMENTS_BY_TAG_NAME](tagName);
	return function () {
		return filterNodesInDocument(helper.nodeListToArray(nodeList));
	};
};

/**
 * `element.getElementsByClassName` strategy
 *
 * @function getElementsByClassName
 * @memberof module:domQueries/QueryStrategyFactory~Strategies
 * @param {HTMLElement} element
 * @param {String} className
 * @returns {Function} wrapped version of `element.querySelectorAll(className)`
 */
Strategies[constants.queries.GET_ELEMENTS_BY_CLASS_NAME] = function (element, className) {
	// a live list, has to be called once, only
	var nodeList = element[constants.queries.GET_ELEMENTS_BY_CLASS_NAME](className);
	return function () {
		return filterNodesInDocument(helper.nodeListToArray(nodeList));
	};
};

module.exports = {

	/**
	 * Create a query function used with a dom element
	 *
	 * @example
	 * var query = QueryStrategyFactory.create('querySelectorAll', document, '.foo');
	 * query(); // [el1, el2, ...]
	 *
	 * @param {String} strategyType the query type
	 * @param {HTMLElement} element
	 * @param {String} selector
	 * @returns {Function} a wrapped query function for the dom element `element`, query `strategyType` and the selector
	 * `selector`
	 */
	create: function (strategyType, element, selector) {
		//console.time("query");
		//console.log("executing query: ", strategyType + "("+selector+")");
		//var result = Strategies[strategyType](element, selector);
		//console.timeEnd("query");
		//return result;
		return Strategies[strategyType](element, selector);
	}
};