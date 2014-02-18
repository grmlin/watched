var smokesignals;
// -----------------------------
// external sources
// -----------------------------

//= include ../node_modules/smokesignals/smokesignals.js

// -----------------------------
// internal sources
// -----------------------------

//= include ./var/globals.js

//= include_tree ./observers

//= include ./domQueries/QueryStrategyFactory.js
//= include ./domQueries/DomQuery.js

//= include ./DomElement.js
//= include ./LiveNodeList.js

var watched = function(element) {
	if (typeof element === STRING) {
		return new DomElement(doc).querySelectorAll(element);
	}
	return new DomElement(element);
};