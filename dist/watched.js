/*!watched.js 0.1.0 - (c) 2014 Andreas Wehr - https://github.com/grmlin/watched - Licensed under MIT license*/(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], function () {
			return (root.watched = factory());
		});
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		// Browser globals
		root.watched = factory();
	}
}(this, function () {
	"use strict";
	var smokesignals;
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

var TRUE = true,
		FALSE = false,
		FUNCTION = 'function',
		STRING = 'string',
//UNDEFINED = undefined,
		MUTATION_DEBOUNCE_DELAY = 20,// bubble dom changes in batches.
		INTERVAL_OBSERVER_RESCAN_INTERVAL = 500,
		INDEX_OF_FAIL = -1,
		CUSTOM_EVENT_ON_MUTATION = 1,
		CUSTOM_EVENT_ON_ELEMENTS_ADDED = 'added',
		CUSTOM_EVENT_ON_ELEMENTS_REMOVED = 'removed',
		CUSTOM_EVENT_ON_ELEMENTS_CHANGED = 'changed',
		QUERY_QUERY_SELECTOR_ALL = 'querySelectorAll',
		QUERY_QUERY_SELECTOR = 'querySelector',
		QUERY_GET_ELEMENTS_BY_TAG_NAME = 'getElementsByTagName',
		QUERY_GET_ELEMENTS_BY_CLASS_NAME = 'getElementsByClassName',
		AVAILABLE_QUERIES = [QUERY_QUERY_SELECTOR_ALL, QUERY_QUERY_SELECTOR, QUERY_GET_ELEMENTS_BY_TAG_NAME,
		                     QUERY_GET_ELEMENTS_BY_CLASS_NAME];

var doc = document,
		hasMutationObserver = !!(window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver),
		NativeMutationObserver = hasMutationObserver ? MutationObserver || WebKitMutationObserver || MozMutationObserver: null;

var isInvalidDomElement = function (el) {
			return AVAILABLE_QUERIES.some(function (query) {
				return typeof el[query] !== FUNCTION;
			});
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
		debounce = function (a, b, c) {
			var d;
			return function () {
				var e = this, f = arguments;
				clearTimeout(d), d = setTimeout(function () {d = null, c || a.apply(e, f)}, b), c && !d && a.apply(e, f)
			}
		};




var IntervalObserver = (function () {

	var allElementsLive = doc.getElementsByTagName('*'),
			getAllAsArray = function () {
				return nodeListToArray(allElementsLive);
			},
			hasChanged = function (oldElements, newElements) {
				if (oldElements.length !== newElements.length) {
					return TRUE;
				}

				// check if the arrays contain
				return oldElements.some(function (element, index) {
					return element !== newElements[index];
				});
			};

	var IntervalObserver = function () {
		smokesignals.convert(this);
		this._currentElements = getAllAsArray();
		this._initialize();
	};

	Object.defineProperties(IntervalObserver.prototype, {
		_initialize: {
			value: function () {
				var _this = this,
						start = function () {
							setTimeout(tick, INTERVAL_OBSERVER_RESCAN_INTERVAL);
						},
						tick = function () {
							_this._checkDom();
							start();
						};

				start();
			}
		},
		_checkDom: {
			value: function () {
				var newElements = getAllAsArray();
				if (hasChanged(this._currentElements, newElements)) {
					this._currentElements = newElements;
					this.emit(CUSTOM_EVENT_ON_MUTATION);
				}

			}
		}
	});

	return IntervalObserver;
}());

var NativeObserver = (function () {
	var opts = {
				childList: TRUE,
				subtree: TRUE
			},
			isElementMutation = function (mutation) {
				return mutation.addedNodes !== null || mutation.removedNodes !== null;
			};

	var NativeObserver = function () {
		smokesignals.convert(this);
		this._observer = new NativeMutationObserver(this._onMutation.bind(this));
		this._observer.observe(doc, opts);
	};

	Object.defineProperties(NativeObserver.prototype, {
		_onMutation: {
			value: debounce(function (mutations) {
				if (mutations.some(isElementMutation, this)) {
					this.emit(CUSTOM_EVENT_ON_MUTATION);
				}
			}, MUTATION_DEBOUNCE_DELAY)
		}

	});

	return NativeObserver;

}());


var QueryStrategyFactory = (function () {
	var strategies = {};

	// element.querySelectorAll
	strategies[QUERY_QUERY_SELECTOR_ALL] = function (element, selector) {
		return function () {
			var nodeList = element[QUERY_QUERY_SELECTOR_ALL](selector);
			return nodeListToArray(nodeList);
		}
	};

	// element.querySelector
	strategies[QUERY_QUERY_SELECTOR] = function (element, selector) {
		return function () {
			var node = element[QUERY_QUERY_SELECTOR](selector);
			return node === null ? [] : [node];
		}
	};

	// element.getElementsByTagName
	strategies[QUERY_GET_ELEMENTS_BY_TAG_NAME] = function (element, tagName) {
		// a live list, has to be called once, only
		var nodeList = element[QUERY_GET_ELEMENTS_BY_TAG_NAME](tagName);
		return function () {
			return nodeListToArray(nodeList);
		}
	};

	// element.getElementsByTagName
	strategies[QUERY_GET_ELEMENTS_BY_CLASS_NAME] = function (element, className) {
		// a live list, has to be called once, only
		var nodeList = element[QUERY_GET_ELEMENTS_BY_CLASS_NAME](className);
		return function () {
			return nodeListToArray(nodeList);
		}
	};

	return {
		create: function (strategyType, element, selector) {
			//console.time("query");
			//console.log("executing query: ", strategyType + "("+selector+")");
			//var result = strategies[strategyType](element, selector);
			//console.timeEnd("query");
			//return result;
			return strategies[strategyType](element, selector);
		}
	}
}());

var DomQuery = function (strategy) {
	this._query = strategy;
	this._old = [];
};

Object.defineProperties(DomQuery.prototype, {
	old: {
		value: function () {
			return arrayClone(this._old);
		}
	},
	current: {
		value: function () {
			this._old = this._query();
			return arrayClone(this._old);
		}
	}
});


var DomElement = function(element) {
	if (isInvalidDomElement(element)) {
		throw new TypeError('changed.js: the element to watch has to be a HTMLElement!');
	}
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

var LiveNodeList = (function () {

	// The one and only local instance of a mutation observer
	var mutationObserver = new (hasMutationObserver ? NativeObserver : IntervalObserver)(),
			diff = function (target, other) {
				return target.filter(function (element) {
					return !arrayContains(element, other);
				});
			};

	// LiveNodeList is an array like object, not inheriting from array
	var LiveNodeList = function (elementQuery) {
		smokesignals.convert(this);

		this._isActive = FALSE;
		this._length = 0;
		this._query = elementQuery;
		this._onMutateHandler = this._onMutate.bind(this);
		this.resume();
	};

	//	LiveNodeList.ADDED   = CUSTOM_EVENT_ON_ELEMENTS_ADDED;
	//	LiveNodeList.REMOVED = CUSTOM_EVENT_ON_ELEMENTS_REMOVED;
	//	LiveNodeList.CHANGED = CUSTOM_EVENT_ON_ELEMENTS_CHANGED;

	Object.defineProperties(LiveNodeList.prototype, {
		_onMutate: {
			value: function () {
				var oldElements = this._query.old(),
						currentElements = this._query.current(),
						addedElements, removedElements, wasAdded, wasRemoved;

				// 1. find all the added elements
				addedElements = diff(currentElements, oldElements);

				// 2. find all the removed elements
				removedElements = diff(oldElements, currentElements);

				// 3. update the nodelist array
				this._updateArray(currentElements);

				wasAdded = addedElements.length > 0;
				wasRemoved = removedElements.length > 0;

				if (wasAdded || wasRemoved) {
					this._bubble(CUSTOM_EVENT_ON_ELEMENTS_CHANGED, currentElements);
				}
				if (wasAdded) {
					this._bubble(CUSTOM_EVENT_ON_ELEMENTS_ADDED, addedElements);
				}
				if (wasRemoved) {
					this._bubble(CUSTOM_EVENT_ON_ELEMENTS_REMOVED, removedElements);
				}

			}
		},
		_updateArray: {
			value: function (currentElements) {
				this._deleteArray();
				this._length = currentElements.length;
				currentElements.forEach(function (el, index) {
					this[index] = el;
				}, this);
			}
		},
		_deleteArray: {
			value: function () {
				Array.prototype.splice.call(this, 0);
				this._length = 0;
			}
		},
		_bubble: {
			value: function (eventType, elementList) {
				this.emit(eventType, elementList);
			}
		},
		forEach: {
			value: function () {
				Array.prototype.forEach.apply(this, arguments);
			}
		},
		pause: {
			value: function () {
				this._isActive = FALSE;
				mutationObserver.off(CUSTOM_EVENT_ON_MUTATION, this._onMutateHandler);
			}
		},
		resume: {
			value: function () {
				if (!this._isActive) {
					this._isActive = TRUE;
					this._updateArray(this._query.current());
					mutationObserver.on(CUSTOM_EVENT_ON_MUTATION, this._onMutateHandler);
				}
			}
		},
		length: {
			get: function () {
				return this._length;
			},
			set: function(value) {
				// we'll do nothing in here, will be called while using array methods on the nodelist
			}
		},
		splice: {
			value: function () {}
		}
	});

	return LiveNodeList;
}());



var watched = function(element) {
	if (typeof element === STRING) {
		return new DomElement(doc).querySelectorAll(element);
	}
	return new DomElement(element);
};
	return watched;
}));