var helper = require('./util/helper'),
	constants = require('./util/constants'),
	QueryStrategyFactory = require('./domQueries/QueryStrategyFactory');


var DomElement = {};

constants.AVAILABLE_QUERIES.forEach(function (queryType) {
		DomElement[queryType] = function (selector) {
			// TODO tiny query factory, better do some error handling?
			var queryStrategy = QueryStrategyFactory.create(queryType, this.el, selector),
				query = new DomQuery(queryStrategy);
			return new LiveNodeList(query);
		};
});



module.exports = function(element){
	if (this instanceof module.exports) {
		throw new Error('The DomElement is a factory function, not a constructor. Don\'t use the new keyword with it');
	}
	if (helper.isInvalidDomElement(element)) {
		throw new TypeError('The element to watch has to be a HTMLElement! The type of the given element is ' + typeof element );
	}

	var domElement = Object.create(DomElement);
	domElement.el = element;
	return domElement;
};