var QueryStrategyFactory = (function () {
	var strategies = {};

	// element.querySelectorAll
	strategies[QUERY_QUERY_SELECTOR_ALL] = function (element, selector) {
		return function () {
			var nodeList = element[QUERY_QUERY_SELECTOR_ALL](selector);
			return nodeListToArray(nodeList);
		}
	};

	// element.querySelector
	strategies[QUERY_QUERY_SELECTOR] = function (element, selector) {
		return function () {
			var node = element[QUERY_QUERY_SELECTOR](selector);
			return node === null ? [] : [node];
		}
	};

	// element.getElementsByTagName
	strategies[QUERY_GET_ELEMENTS_BY_TAG_NAME] = function (element, tagName) {
		// a live list, has to be called once, only
		var nodeList = element[QUERY_GET_ELEMENTS_BY_TAG_NAME](tagName);
		return function () {
			return nodeListToArray(nodeList);
		}
	};

	// element.getElementsByTagName
	strategies[QUERY_GET_ELEMENTS_BY_CLASS_NAME] = function (element, className) {
		// a live list, has to be called once, only
		var nodeList = element[QUERY_GET_ELEMENTS_BY_CLASS_NAME](className);
		return function () {
			return nodeListToArray(nodeList);
		}
	};

	return {
		create: function (strategyType, element, selector) {
			//console.time("query");
			//console.log("executing query: ", strategyType + "("+selector+")");
			//var result = strategies[strategyType](element, selector);
			//console.timeEnd("query");
			//return result;
			return strategies[strategyType](element, selector);
		}
	}
}());