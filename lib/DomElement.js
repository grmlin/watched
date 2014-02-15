var DomElement = function(element) {


	this._el = element;
};

AVAILABLE_QUERIES.forEach(function(queryType){
	Object.defineProperty(DomElement.prototype, queryType, {
		value: function(selector){
			// TODO tiny query factory, better do some error handling?
			var queryStrategy =  QueryStrategyFactory.create(queryType, this._el, selector),
					query = new DomQuery(queryStrategy);
			return new LiveNodeList(query);
		}
	});
});