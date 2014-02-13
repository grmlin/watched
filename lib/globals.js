var win = window,
		doc = document,
		docElement = doc.documentElement,
		querySelectorAll = doc.querySelectorAll.bind(doc),
		NativeMutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null,
		hasMutationObserver = NativeMutationObserver !== null,
		hasPropertyChangeEvent = 'onpropertychange' in document.createElement('div');

var nodeListToArray = function (nodeList) {
			return Array.prototype.slice.call(nodeList)
		},
		arrayContains = function (element, list) {
			return list.indexOf(element) !== INDEX_OF_FAIL;
		},
		arrayClone = function (arr) {
			return arr.slice(0);
		},
		throttle = function (fn, threshhold, scope) {
			threshhold || (threshhold = 250);
			var last,
					deferTimer;
			return function () {
				var context = scope || this;

				var now = +new Date,
						args = arguments;
				if (last && now < last + threshhold) {
					// hold on to it
					clearTimeout(deferTimer);
					deferTimer = setTimeout(function () {
						last = now;
						fn.apply(context, args);
					}, threshhold);
				} else {
					last = now;
					fn.apply(context, args);
				}
			};
		},
		debounce = function (a,b,c){var d;return function(){var e=this,f=arguments;clearTimeout(d),d=setTimeout(function(){d=null,c||a.apply(e,f)},b),c&&!d&&a.apply(e,f)}};

var MUTATION_DEBOUNCE_DELAY = 10,
		TIMEOUT_CLOCK_RESCAN_INTERVAL = 500,
		INDEX_OF_FAIL = -1,
		CUSTOM_EVENT_ON_MUTATION = 1,
		CUSTOM_EVENT_ON_ELEMENTS_ADDED = 2,
		CUSTOM_EVENT_ON_ELEMENTS_REMOVED = 3,
		DOM_EVENT_DOM_CONTENT_LOADED = 'DOMContentLoaded';
