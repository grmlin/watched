// -----------------------------
// external sources
// -----------------------------

smokesignals = {
    convert: function(obj, handlers) {
        // we store the list of handlers as a local variable inside the scope
        // so that we don't have to add random properties to the object we are
        // converting. (prefixing variables in the object with an underscore or
        // two is an ugly solution)
        // we declare the variable in the function definition to use two less
        // characters (as opposed to using 'var ').  I consider this an inelegant
        // solution since smokesignals.convert.length now returns 2 when it is
        // really 1, but doing this doesn't otherwise change the functionallity of
        // this module, so we'll go with it for now
        handlers = {};

        // add a listener
        obj.on = function(eventName, handler) {
            // either use the existing array or create a new one for this event
            (handlers[eventName] || (handlers[eventName] = []))
                // add the handler to the array
                .push(handler);

            return obj;
        }

        // add a listener that will only be called once
        obj.once = function(eventName, handler) {
            // create a wrapper listener, that will remove itself after it is called
            function wrappedHandler() {
                // remove ourself, and then call the real handler with the args
                // passed to this wrapper
                handler.apply(obj.off(eventName, wrappedHandler), arguments);
            }
            // in order to allow that these wrapped handlers can be removed by
            // removing the original function, we save a reference to the original
            // function
            wrappedHandler.h = handler;

            // call the regular add listener function with our new wrapper
            return obj.on(eventName, wrappedHandler);
        }

        // remove a listener
        obj.off = function(eventName, handler) {
            // loop through all handlers for this eventName, assuming a handler
            // was passed in, to see if the handler passed in was any of them so
            // we can remove it
            for (var list = handlers[eventName], i = 0; handler && list && list[i]; i++) {
                // either this item is the handler passed in, or this item is a
                // wrapper for the handler passed in.  See the 'once' function
                list[i] != handler && list[i].h != handler ||
                    // remove it!
                    list.splice(i--,1);
            }
            // if i is 0 (i.e. falsy), then there are no items in the array for this
            // event name (or the array doesn't exist)
            if (!i) {
                // remove the array for this eventname (if it doesn't exist then
                // this isn't really hurting anything)
                delete handlers[eventName];
            }
            return obj;
        }

        obj.emit = function(eventName) {
            // loop through all handlers for this event name and call them all
            for(var list = handlers[eventName], i = 0; list && list[i];) {
                list[i++].apply(obj, list.slice.call(arguments, 1));
            }
            return obj;
        }

        return obj;
    }
}



// -----------------------------
// internal sources
// -----------------------------

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




var IntervalObserver = function (selector) {
	smokesignals.convert(this);
};

IntervalObserver.prototype.initialize = function () {
	var _this = this,
			start = function () {
				setTimeout(tick, TIMEOUT_CLOCK_RESCAN_INTERVAL)
			},
			tick = function () {
				_this.emit(CUSTOM_EVENT_ON_MUTATION);
				start();
			};

	start();
};


var NativeObserver = (function () {
	var opts = {
				childList: true,
				subtree: true
			},
			isElementMutation = function (mutation) {
				return mutation.addedNodes !== null || mutation.removedNodes !== null;
			};

	var NativeObserver = function (selector) {
		smokesignals.convert(this);

		this._selector = selector;
	};

	NativeObserver.prototype.initialize = function () {
		this._observer = new NativeMutationObserver(this._onMutation.bind(this));
		this._observer.observe(document.body, opts);
	};

	NativeObserver.prototype._onMutation = debounce(function (mutations, observer) {
		if (mutations.some(isElementMutation, this)) {
			this.emit(CUSTOM_EVENT_ON_MUTATION);
		}
	}, MUTATION_DEBOUNCE_DELAY);

	return NativeObserver;

}());
var PropertyChangeObserver = function (selector){
	smokesignals.convert(this);
};



var MutationObserverFactory = {
	createObserver: function(){
		var Observer;
		console.log("Created Observer: ");

		if (hasMutationObserver) {
			Observer = NativeObserver;
			console.log("native");
		} else if (hasPropertyChangeEvent) {
			Observer = PropertyChangeObserver;
			console.log("IE");
		} else {
			Observer = IntervalObserver;
			console.log("Interval");
		}
		return new Observer();
	}
};

var DomObserver = (function () {
	var mutationObserver = MutationObserverFactory.createObserver(),
			getElements = function (selector) {
				var nodeList = querySelectorAll(selector);
				return nodeListToArray(nodeList);
			},
			diff = function (target, other) {
				return target.filter(function (element) {
					return !arrayContains(element, other);
				});
			};

	doc.addEventListener(DOM_EVENT_DOM_CONTENT_LOADED, mutationObserver.initialize.bind(mutationObserver));

	var DomObserver = function (selector) {
		smokesignals.convert(this);

		this._selector = selector;
		this._currentElements = [];

		mutationObserver.on(CUSTOM_EVENT_ON_MUTATION, this._onMutate.bind(this));
	};

	DomObserver.prototype._onMutate = function () {
		var oldElements = this._currentElements,
				newElements = getElements(this._selector),
				addedElements, removedElements;

		// 1. find all the added elements
		addedElements = diff(newElements, oldElements);

		// 2. find all the removed elements
		removedElements = diff(oldElements, newElements);

		// 3. save the current elements
		this._currentElements = newElements;

		if (addedElements.length > 0) {
			this._bubble(CUSTOM_EVENT_ON_ELEMENTS_ADDED, addedElements);
		}
		if (removedElements.length > 0) {
			this._bubble(CUSTOM_EVENT_ON_ELEMENTS_REMOVED, removedElements);
		}

	};

	DomObserver.prototype._bubble = function (eventType, elementList) {
		this.emit(eventType, arrayClone(elementList), this.elements);
	};

	Object.defineProperty(DomObserver.prototype, 'elements', {
		get: function(){
			return arrayClone(this._currentElements);
		}
	});

	return DomObserver;
}());



var changed = {
	event : {
		ELEMENTS_ADDED: CUSTOM_EVENT_ON_ELEMENTS_ADDED,
		ELEMENTS_REMOVED: CUSTOM_EVENT_ON_ELEMENTS_REMOVED
	},

	watch: function (selector) {
		return new DomObserver(selector);
	}
};
