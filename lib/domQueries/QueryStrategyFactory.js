var QueryStrategyFactory = (function () {
	var strategies = {};

	// element.querySelectorAll
	strategies[QUERY_QUERY_SELECTOR_ALL] = function (element, selector) {
		return function () {
			var nodeList = element.querySelectorAll(selector);
			return nodeListToArray(nodeList);
		}
	};

	// element.querySelector
	strategies[QUERY_QUERY_SELECTOR] = function (element, selector) {
		return function () {
			var node = element.querySelectorAll(selector);
			return node === null ? [] : [node];
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