
var constants = {

	MUTATION_DEBOUNCE_DELAY : 20,// bubble dom changes in batches.
	INTERVAL_OBSERVER_RESCAN_INTERVAL : 500,
	CUSTOM_EVENT_ON_MUTATION : 'CUSTOM_EVENT_ON_MUTATION',
	CUSTOM_EVENT_ON_ELEMENTS_ADDED : 'added',
	CUSTOM_EVENT_ON_ELEMENTS_REMOVED : 'removed',
	CUSTOM_EVENT_ON_ELEMENTS_CHANGED : 'changed',
	QUERY_QUERY_SELECTOR_ALL : 'querySelectorAll',
	QUERY_QUERY_SELECTOR : 'querySelector',
	QUERY_GET_ELEMENTS_BY_TAG_NAME : 'getElementsByTagName',
	QUERY_GET_ELEMENTS_BY_CLASS_NAME : 'getElementsByClassName'
};

Object.defineProperty(constants, 'AVAILABLE_QUERIES', {
	get: function(){
		return [constants.QUERY_QUERY_SELECTOR_ALL, constants.QUERY_QUERY_SELECTOR, constants.QUERY_GET_ELEMENTS_BY_TAG_NAME, constants.QUERY_GET_ELEMENTS_BY_CLASS_NAME];
	}
});

module.exports = constants;