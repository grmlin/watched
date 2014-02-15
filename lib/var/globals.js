var TRUE = true,
		FALSE = false,
		MUTATION_DEBOUNCE_DELAY = 10,// bubble dom changes in batches.
		TIMEOUT_CLOCK_RESCAN_INTERVAL = 500,
		INDEX_OF_FAIL = -1,
		CUSTOM_EVENT_ON_MUTATION = 1,
		CUSTOM_EVENT_ON_ELEMENTS_ADDED = 2,
		CUSTOM_EVENT_ON_ELEMENTS_REMOVED = 3,
		DOM_EVENT_DOM_CONTENT_LOADED = 'DOMContentLoaded',
		QUERY_QUERY_SELECTOR_ALL = 'querySelectorAll',
		AVAILABLE_QUERIES = [QUERY_QUERY_SELECTOR_ALL];

var doc = document,
		NativeMutationObserver = MutationObserver || WebKitMutationObserver || MozMutationObserver || null,
		hasMutationObserver = NativeMutationObserver !== null;

var ready = function(cb) {
			if ( doc.readyState === "complete" ) {
				// Handle it asynchronously to allow scripts the opportunity to delay ready
				setTimeout(cb, 1);
			} else {
				var completed = function(){
					doc.removeEventListener(DOM_EVENT_DOM_CONTENT_LOADED, completed, FALSE );
					cb();
				};
				doc.addEventListener( DOM_EVENT_DOM_CONTENT_LOADED, completed, FALSE );
			}
		},
		nodeListToArray = function (nodeList) {
			return Array.prototype.slice.call(nodeList)
		},
		arrayContains = function (element, list) {
			return list.indexOf(element) !== INDEX_OF_FAIL;
		},
		arrayClone = function (arr) {
			return arr.slice(0);
		},
		debounce = function (a,b,c){var d;return function(){var e=this,f=arguments;clearTimeout(d),d=setTimeout(function(){d=null,c||a.apply(e,f)},b),c&&!d&&a.apply(e,f)}};

