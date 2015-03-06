var constants = require('../util/constants'),
	helper = require('../util/helper'),
	strategies = {};

var filterNodesInDocument = function(nodeArray){
	return nodeArray.filter(function(node) {
		return document.contains(node);
	});
};

// element.querySelectorAll
strategies[constants.queries.QUERY_SELECTOR_ALL] = function (element, selector) {
	return function () {
		var nodeList = element[constants.queries.QUERY_SELECTOR_ALL](selector);
		return filterNodesInDocument(helper.nodeListToArray(nodeList));
	}
};

// element.querySelector
strategies[constants.queries.QUERY_SELECTOR] = function (element, selector) {
	return function () {
		var node = element[constants.queries.QUERY_SELECTOR](selector);
		return filterNodesInDocument(node === null ? [] : [node]);
	}
};

// element.getElementsByTagName
strategies[constants.queries.GET_ELEMENTS_BY_TAG_NAME] = function (element, tagName) {
	// a live list, has to be called once, only
	var nodeList = element[constants.queries.GET_ELEMENTS_BY_TAG_NAME](tagName);
	return function () {
		return filterNodesInDocument(helper.nodeListToArray(nodeList));
	}
};

// element.getElementsByTagName
strategies[constants.queries.GET_ELEMENTS_BY_CLASS_NAME] = function (element, className) {
	// a live list, has to be called once, only
	var nodeList = element[constants.queries.GET_ELEMENTS_BY_CLASS_NAME](className);
	return function () {
		return filterNodesInDocument(helper.nodeListToArray(nodeList));
	}
};

module.exports = {
	create: function (strategyType, element, selector) {
		//console.time("query");
		//console.log("executing query: ", strategyType + "("+selector+")");
		//var result = strategies[strategyType](element, selector);
		//console.timeEnd("query");
		//return result;
		return strategies[strategyType](element, selector);
	}
};