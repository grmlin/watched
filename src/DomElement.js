var helper = require('./util/helper'),
		constants = require('./util/constants');


var DomElement = function (element) {
	if (helper.isInvalidDomElement(element)) {
		throw new TypeError('changed.js: the element to watch has to be a HTMLElement!');
	}
	this._el = element;
};

constants.AVAILABLE_QUERIES.forEach(function (queryType) {
	Object.defineProperty(DomElement.prototype, queryType, {
		value: function (selector) {
			// TODO tiny query factory, better do some error handling?
			var queryStrategy = QueryStrategyFactory.create(queryType, this._el, selector),
				query = new DomQuery(queryStrategy);
			return new LiveNodeList(query);
		}
	});
});