var QueryStrategyFactory = (function () {
	var strategies = {};

	// element.querySelectorAll
	strategies[QUERY_QUERY_SELECTOR_ALL] = function (element, selector) {
		var nodeList = element.querySelectorAll(selector);
		return nodeListToArray(nodeList);
	};

	return {
		create: function(strategyType, element, selector) {
			return function(){
				//console.time("query");
				//console.log("executing query: ", strategyType + "("+selector+")");
				//var result = strategies[strategyType](element, selector);
				//console.timeEnd("query");
				//return result;
				return strategies[strategyType](element, selector);
			};
		}
	}
}());