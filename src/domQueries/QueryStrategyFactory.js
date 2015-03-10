var constants = require('../util/constants'),
	helper = require('../util/helper'),
	strategies = {};

var filterNodesInDocument = function(nodeArray){
	return nodeArray.filter(function(node) {
		return document.documentElement.contains(node);
	});
};

// element.querySelectorAll
strategies[constants.queries.QUERY_SELECTOR_ALL] = function (element, selector) {
	return function () {
		var nodeList = element[constants.queries.QUERY_SELECTOR_ALL](selector);
		return filterNodesInDocument(helper.nodeListToArray(nodeList));
	};
};

// element.querySelector
strategies[constants.queries.QUERY_SELECTOR] = function (element, selector) {
	return function () {
		var node = element[constants.queries.QUERY_SELECTOR](selector);
		return filterNodesInDocument(node === null ? [] : [node]);
	};
};

// element.getElementsByTagName
strategies[constants.queries.GET_ELEMENTS_BY_TAG_NAME] = function (element, tagName) {
	// a live list, has to be called once, only
	var nodeList = element[constants.queries.GET_ELEMENTS_BY_TAG_NAME](tagName);
	return function () {
		return filterNodesInDocument(helper.nodeListToArray(nodeList));
	};
};

// element.getElementsByTagName
strategies[constants.queries.GET_ELEMENTS_BY_CLASS_NAME] = function (element, className) {
	// a live list, has to be called once, only
	var nodeList = element[constants.queries.GET_ELEMENTS_BY_CLASS_NAME](className);
	return function () {
		return filterNodesInDocument(helper.nodeListToArray(nodeList));
	};
};

/**
 * exports the QueryStrategyFactory
 *
 * @exports domQueries/QueryStrategyFactory
 *
 */

module.exports = {

	/**
	 * Create a query function used with a dom element
	 *
	 * #### Example
	 *
	 * ```js
	 * var query = QueryStrategyFactory.create('querySelectorAll', document, '.foo');
	 *
	 * query(); // [el1, el2, ...]
	 * ```
	 *
	 * @param {String} strategyType the query type
	 * @param {HTMLElement} element
	 * @param {String} selector
	 * @returns {Function}
	 */
	create: function (strategyType, element, selector) {
		//console.time("query");
		//console.log("executing query: ", strategyType + "("+selector+")");
		//var result = strategies[strategyType](element, selector);
		//console.timeEnd("query");
		//return result;
		return strategies[strategyType](element, selector);
	}
};