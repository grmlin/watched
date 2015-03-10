/*!watched.js 0.3.1 - (c) 2014-2015 Andreas Wehr - https://github.com/grmlin/watched - Licensed under MIT license*/
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.watched = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var existed = false;
var old;

if ('smokesignals' in global) {
    existed = true;
    old = global.smokesignals;
}

require('./smokesignals');

module.exports = smokesignals;

if (existed) {
    global.smokesignals = old;
}
else {
    delete global.smokesignals;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./smokesignals":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
var helper = require('./util/helper'),
	constants = require('./util/constants'),
	LiveNodeList = require('./LiveNodeList'),
	QueryStrategyFactory = require('./domQueries/QueryStrategyFactory'),
	ModuleFactory = require('./ModuleFactory')
	DomQuery = require('./domQueries/DomQuery');

/**
 * exports object decorating native dom elements so it uses the internal `LiveNodeList`
 *
 * @exports DomElement
 */
var DomElement = {
	__name__: 'DomElement',

	/**
	 * Initialize the DomElement
	 * @param {HTMLElement} element
	 */
	init: function (element) {
		/**
		 * The dom element used for all queries/selectors
		 * @type {HTMLElement}
		 */
		this.el = element;
	},
};

/**
 * Add all available queries to the DomElement's prototype
 */
constants.AVAILABLE_QUERIES.forEach(function (queryType) {
	DomElement[queryType] = function (selector) {
		// TODO tiny query factory, better do some error handling?
		var queryStrategy = QueryStrategyFactory.create(queryType, this.el, selector);

		return ModuleFactory.createLiveNodeList(queryStrategy);
	};
});


/**
 * See [`querySelectorAll`](http://devdocs.io/dom/document.queryselectorall) for details.
 *
 * @var {Function} querySelectorAll
 * @function
 * @memberOf module:DomElement
 * @param {String} selector
 * @returns {module:LiveNodeList}
 */

/**
 * See [`querySelector`](http://devdocs.io/dom/document.queryselector) for details. The returned object will be always
 * a `LiveNodeList`, not a single element as in the native `querySelector`.
 *
 * @var {Function} querySelector
 * @function
 * @memberOf module:DomElement
 * @param element
 * @returns {module:LiveNodeList}
 */

/**
 * See [`getElementsByTagName`](http://devdocs.io/dom/element.getelementsbytagname) for details. Should be faster than
 * the query selectors, as **watched.js** uses the native live nodelist internally to get the elements you want.
 *
 * @var {Function} getElementsByTagName
 * @function
 * @memberOf module:DomElement
 * @param {String} selector
 * @returns {module:LiveNodeList}
 */


/**
 * See [`getElementsByClassName`](http://devdocs.io/dom/document.getelementsbyclassname) for details. Should be faster
 * than the query selectors, as **watched.js** uses the native live nodelist internally to get the elements you want.
 *
 * @var {Function} getElementsByClassName
 * @function
 * @memberOf module:DomElement
 * @param {String} selector
 * @returns {module:LiveNodeList}
 */


module.exports = DomElement;
},{"./LiveNodeList":4,"./ModuleFactory":5,"./domQueries/DomQuery":6,"./domQueries/QueryStrategyFactory":7,"./util/constants":10,"./util/helper":11}],4:[function(require,module,exports){
var smokesignals     = require('smokesignals'),
		constants        = require('./util/constants'),
		helper           = require('./util/helper'),
		NativeObserver   = require('./observers/NativeObserver'),
		IntervalObserver = require('./observers/IntervalObserver');

// The one and only local instance of a mutation observer
var mutationObserver = Object.create(helper.hasMutationObserver ? NativeObserver : IntervalObserver);
mutationObserver.init();

/**
 * diffs two arrays, returns the difference
 *
 *  diff([1,2],[2,3,4]); //[1]
 *
 * @param {Array} target
 * @param {Array} other
 * @returns {Array}
 * @private
 */
var diff = function (target, other) {
	return target.filter(function (element) {
		return !helper.arrayContains(other, element);
	});
};


/**
 *
 * A list of dom elements, always up to date. It's "array-like", similar to jquery objects or native node lists.
 *
 * - live list, similar to the list returned by `getElementsBy(Tag|Class)Name`
 * - dispatches event, if the list changed!
 *
 * @exports LiveNodeList
 * @fires module:LiveNodeList#changed
 * @fires module:LiveNodeList#added
 * @fires module:LiveNodeList#removed
 */
var LiveNodeList = {
	/**
	 * name helper, mainly used for tests
	 * @private
	 * */
	__name__: 'LiveNodeList',

	/**
	 * Initialize the LiveNodeList
	 * @param {DomQuery} elementQuery
	 */
	init: function (elementQuery) {
		this._isActive = false;
		this._length = 0;
		this._query = elementQuery;
		this._onMutateHandler = this._onMutate.bind(this);
		this.resume();
	},

	_onMutate: function () {
		var oldElements     = this._query.old(),
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
			/**
			 * LiveNodeList event
			 *
			 * Event called when new elements are added to or removed from the dom
			 *
			 * @example
			 * ```javascript
			 *            nodeList.on('changed', function(currentElements){
			 *	console.log(currentElements);
			 * });
			 * ```
			 *
			 * The event listeners callback will be called with one argument: an array containing all elements currently in the list
			 *
			 * @event module:LiveNodeList#changed
			 * @type {Array}
			 */
			this._bubble(constants.CUSTOM_EVENT_ON_ELEMENTS_CHANGED, currentElements);
		}
		if (wasAdded) {
			/**
			 * LiveNodeList event
			 * Event called when new elements are added to the dom
			 *
			 * @example
			 * ```javascript
			 * 	nodeList.on('added', function(newElements){
			 * 	 console.log(newElements);
			 * });
			 * ```
			 *
			 * The event listeners callback will be called with one argument: an array containing the newly found dom elements
			 *
			 * @event module:LiveNodeList#added
			 * @type {Array}
			 */
			this._bubble(constants.CUSTOM_EVENT_ON_ELEMENTS_ADDED, addedElements);
		}
		if (wasRemoved) {
			/**
			 * LiveNodeList event
			 * Event called when elements are removed from the dom
			 *
			 * @example
			 * ```javascript
			 * 	nodeList.on('removed', function(removedElements){
			 * 		console.log(removedElements);
			 *	});
			 * ```
			 * The event listeners callback will be called with one argument: an array `removedElements` containing the dom elements removed from the list (removed from the dom)
			 *
			 * @event module:LiveNodeList#removed
			 * @type {Array}
			 */
			this._bubble(constants.CUSTOM_EVENT_ON_ELEMENTS_REMOVED, removedElements);
		}

	},
	_updateArray: function (currentElements) {
		this._deleteArray();
		this._length = currentElements.length;
		currentElements.forEach(function (el, index) {
			this[index] = el;
		}, this);
	},
	_deleteArray: function () {
		Array.prototype.splice.call(this, 0);
		this._length = 0;
	},
	_bubble: function (eventType, elementList) {
		this.emit(eventType, elementList);
	},

	/**
	 * see the native [`Array.forEach`](http://devdocs.io/javascript/global_objects/array/foreach) for details.
	 *
	 * @param {Function} callback
	 * @param {Object} thisArg
	 */
	forEach: function () {
		Array.prototype.forEach.apply(this, arguments);
	},
	/**
	 * Freezes the nodelist in it's current form and pauses the dom mutation listener
	 *
	 * ```javascript
	 * 	 nodeList.pause();
	 * ```
	 */
	pause: function () {
		this._isActive = false;
		mutationObserver.off(constants.CUSTOM_EVENT_ON_MUTATION, this._onMutateHandler);
	},
	resume: function () {
		if (!this._isActive) {
			this._isActive = true;
			this._updateArray(this._query.current());
			mutationObserver.on(constants.CUSTOM_EVENT_ON_MUTATION, this._onMutateHandler);
		}
	}
};

Object.defineProperty(LiveNodeList, 'length', {
	get: function () {
		return this._length;
	},
	set: function (value) {
		// we'll do nothing in here, will be called while using array methods on the nodelist
	}
});

smokesignals.convert(LiveNodeList);

module.exports = LiveNodeList;
},{"./observers/IntervalObserver":8,"./observers/NativeObserver":9,"./util/constants":10,"./util/helper":11,"smokesignals":1}],5:[function(require,module,exports){
var DomElement = require('./DomElement');
var LiveNodeList = require('./LiveNodeList');
var DomQuery = require('./domQueries/DomQuery');

/**
 * exports multiple factory functions
 *
 * @exports ModuleFactory
 */

module.exports = {
	/**
	 * factory method to create new `DomElement` objects
	 *
	 * @param {HTMLElement} element
	 * @returns {DomElement}
	 */
	createDomElement: function(element){
		if (this instanceof module.exports) {
			throw new Error('The DomElement is a factory function, not a constructor. Don\'t use the new keyword with it');
		}
		if (helper.isInvalidDomElement(element)) {
			throw new TypeError('The element to watch has to be a HTMLElement! The type of the given element is ' + typeof element );
		}

		var domElement = Object.create(DomElement);
		domElement.init(element);
		return domElement;
	},

	/**
	 * factory method to create new `LiveNodeList` objects
	 *
	 * @param {module:domQueries/QueryStrategyFactory} queryStrategy
	 * @returns {module:LiveNodeList}
	 */
	createLiveNodeList: function (queryStrategy) {
		if (this instanceof module.exports) {
			throw new Error('The LiveNodeList is a factory function, not a constructor. Don\'t use the new keyword with it');
		}

		var query = Object.create(DomQuery),
			nodeList = Object.create(LiveNodeList);

		query.init(queryStrategy);
		nodeList.init(query);
		return nodeList;
	},

};
},{"./DomElement":3,"./LiveNodeList":4,"./domQueries/DomQuery":6}],6:[function(require,module,exports){
var helper = require('../util/helper');

var DomQuery = {
	init: function (strategy) {
		this._query = strategy;
		this._old = [];
	},

	old: function () {
		return helper.arrayClone(this._old);
	},

	current: function () {
		this._old = this._query();
		return helper.arrayClone(this._old);
	}
};

module.exports = DomQuery;
},{"../util/helper":11}],7:[function(require,module,exports){
var constants = require('../util/constants'),
	helper = require('../util/helper'),
	strategies = {};

var filterNodesInDocument = function(nodeArray){
	return nodeArray.filter(function(node) {
		return document.contains(node);
	});
};

// element.querySelectorAll
strategies[constants.queries.QUERY_SELECTOR_ALL] = function (element, selector) {
	return function () {
		var nodeList = element[constants.queries.QUERY_SELECTOR_ALL](selector);
		return filterNodesInDocument(helper.nodeListToArray(nodeList));
	}
};

// element.querySelector
strategies[constants.queries.QUERY_SELECTOR] = function (element, selector) {
	return function () {
		var node = element[constants.queries.QUERY_SELECTOR](selector);
		return filterNodesInDocument(node === null ? [] : [node]);
	}
};

// element.getElementsByTagName
strategies[constants.queries.GET_ELEMENTS_BY_TAG_NAME] = function (element, tagName) {
	// a live list, has to be called once, only
	var nodeList = element[constants.queries.GET_ELEMENTS_BY_TAG_NAME](tagName);
	return function () {
		return filterNodesInDocument(helper.nodeListToArray(nodeList));
	}
};

// element.getElementsByTagName
strategies[constants.queries.GET_ELEMENTS_BY_CLASS_NAME] = function (element, className) {
	// a live list, has to be called once, only
	var nodeList = element[constants.queries.GET_ELEMENTS_BY_CLASS_NAME](className);
	return function () {
		return filterNodesInDocument(helper.nodeListToArray(nodeList));
	}
};

/**
 * exports the QueryStrategyFactory
 * @module domQueries/QueryStrategyFactory
 *
 */

module.exports = {

	/**
	 * Create a query function used with a dom element
	 *
	 * #### Example
	 *
	 * ```js
	 * var query = QueryStrategyFactory.create('querySelectorAll', document, '.foo');
	 *
	 * query(); // [el1, el2, ...]
	 * ```
	 *
	 * @param {String} strategyType the query type
	 * @param {HTMLElement} element
	 * @param {String} selector
	 * @returns {Function}
	 */
	create: function (strategyType, element, selector) {
		//console.time("query");
		//console.log("executing query: ", strategyType + "("+selector+")");
		//var result = strategies[strategyType](element, selector);
		//console.timeEnd("query");
		//return result;
		return strategies[strategyType](element, selector);
	}
};
},{"../util/constants":10,"../util/helper":11}],8:[function(require,module,exports){
var smokesignals = require('smokesignals'),
		helper       = require('../util/helper'),
		constants    = require('../util/constants');

var allElementsLive = document.getElementsByTagName('*'),
		getAllAsArray   = function () {
			return helper.nodeListToArray(allElementsLive);
		},
		hasChanged      = function (oldElements, newElements) {
			if (oldElements.length !== newElements.length) {
				return true;
			}

			// check if the arrays contain
			return oldElements.some(function (element, index) {
				return element !== newElements[index];
			});
		};


var IntervalObserver = {
	init: function () {
		this._currentElements = getAllAsArray();
		this._initialize();
	},
	_initialize: function () {
		var _this = this,
				start = function () {
					setTimeout(tick, constants.INTERVAL_OBSERVER_RESCAN_INTERVAL);
				},
				tick  = function () {
					_this._checkDom();
					start();
				};

		start();
	},
	_checkDom: function () {
		var newElements = getAllAsArray();
		if (hasChanged(this._currentElements, newElements)) {
			this._currentElements = newElements;
			this.emit(constants.CUSTOM_EVENT_ON_MUTATION);
		}

	}
};

smokesignals.convert(IntervalObserver);


module.exports = IntervalObserver;

},{"../util/constants":10,"../util/helper":11,"smokesignals":1}],9:[function(require,module,exports){
var smokesignals      = require('smokesignals'),
		helper = require('../util/helper'),
		constants = require('../util/constants'),
		opts              = {
			childList: true,
			subtree: true
		},
		isElementMutation = function (mutation) {
			return mutation.addedNodes !== null || mutation.removedNodes !== null;
		};

var NativeObserver = {

	init: function(){
		this._observer = new helper.NativeMutationObserver(this._onMutation.bind(this));
		this._observer.observe(document, opts);
	},

	_onMutation: helper.debounce(function (mutations) {
			if (mutations.some(isElementMutation, this)) {
				this.emit(constants.CUSTOM_EVENT_ON_MUTATION);
			}
		}, constants.MUTATION_DEBOUNCE_DELAY)
};

smokesignals.convert(NativeObserver);

module.exports = NativeObserver;
},{"../util/constants":10,"../util/helper":11,"smokesignals":1}],10:[function(require,module,exports){

var constants = {

	MUTATION_DEBOUNCE_DELAY : 20,// bubble dom changes in batches.
	INTERVAL_OBSERVER_RESCAN_INTERVAL : 500,
	CUSTOM_EVENT_ON_MUTATION : 'CUSTOM_EVENT_ON_MUTATION',
	CUSTOM_EVENT_ON_ELEMENTS_ADDED : 'added',
	CUSTOM_EVENT_ON_ELEMENTS_REMOVED : 'removed',
	CUSTOM_EVENT_ON_ELEMENTS_CHANGED : 'changed',
	AVAILABLE_QUERIES: [],
	queries: {
		QUERY_SELECTOR_ALL : 'querySelectorAll',
		QUERY_SELECTOR : 'querySelector',
		GET_ELEMENTS_BY_TAG_NAME : 'getElementsByTagName',
		GET_ELEMENTS_BY_CLASS_NAME : 'getElementsByClassName'
	}

};

//constants.queries
Object.keys(constants.queries).forEach(function(index){
	constants.AVAILABLE_QUERIES.push(constants.queries[index]);
});

module.exports = constants;
},{}],11:[function(require,module,exports){
var constants = require('./constants');

var INDEX_OF_FAIL = -1;

var hasMutationObserver = !!(window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver),
	NativeMutationObserver = hasMutationObserver ? MutationObserver || WebKitMutationObserver || MozMutationObserver : null;


module.exports = {

	hasMutationObserver: hasMutationObserver,

	NativeMutationObserver: NativeMutationObserver,

	isInvalidDomElement: function (el) {
		if (el) {
			return constants.AVAILABLE_QUERIES.some(function (query) {
				return typeof el[query] !== 'function';
			});
		} else {
			return true;
		}
	},
	nodeListToArray: function (nodeList) {
		return Array.prototype.slice.call(nodeList)
	},
	arrayContains: function (list, element) {
		return list.indexOf(element) !== INDEX_OF_FAIL;
	},
	arrayClone: function (arr) {
		return arr.slice(0);
	},
	debounce: function (a, b, c) {
		var d;
		return function () {
			var e = this, f = arguments;
			clearTimeout(d), d = setTimeout(function () {
				d = null, c || a.apply(e, f)
			}, b), c && !d && a.apply(e, f);
		}
	}
};
},{"./constants":10}],12:[function(require,module,exports){
var ModuleFactory = require('./ModuleFactory');
/**
 * The exposed watched elements factory
 * @module watched
 */

/**
 * Creates a `LiveNodeList` directly or a decorated `HTMLElement` as `DomElement` to get lists with
 * different queries by yourself.
 *
 * Use a selector to get a `LiveNodeList` or an `HTMLElement` for complete control
 *
 *
 * #### Examples
 *
 * ```js
 * var foos = watched('.foo');
 * ```
 *
 * or
 *
 * ```js
 * var foos = watched(document).querySelectorAll('.foo');
 * ```
 *
 * @throws {Error}
 * @param {String|HTMLElement} element
 * @returns {LiveNodeList|DomElement}
 */
module.exports = function (element) {

	if (this instanceof module.exports) {
		throw new Error('watched is a factory function, not a constructor. Don\'t use the new keyword with it');
	}

	// a string will be used as a querySelectorAll shortcut on the document element
	if (typeof element === 'string') {
		return ModuleFactory.createDomElement(document).querySelectorAll(element);
	} else {
		return ModuleFactory.createDomElement(element);
	}
};
},{"./ModuleFactory":5}]},{},[12])(12)
});