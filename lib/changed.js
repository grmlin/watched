// -----------------------------
// external sources
// -----------------------------

//= include ../node_modules/smokesignals/smokesignals.js

// -----------------------------
// internal sources
// -----------------------------

//= include ./globals.js

//= include_tree ./observer/mutationObservers
//= include ./observer/MutationObserverFactory.js
//= include ./observer/DomObserver.js

var changed = {
	event : {
		ELEMENTS_ADDED: CUSTOM_EVENT_ON_ELEMENTS_ADDED,
		ELEMENTS_REMOVED: CUSTOM_EVENT_ON_ELEMENTS_REMOVED
	},

	watch: function (selector) {
		return new DomObserver(selector);
	}
};
