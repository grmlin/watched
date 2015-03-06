/*!watched.js 0.3.1 - (c) 2014 Andreas Wehr - https://github.com/grmlin/watched - Licensed under MIT license*/(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.watched = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
	DomQuery = require('./domQueries/DomQuery');


var DomElement = {
	__name__: 'DomElement'
};

constants.AVAILABLE_QUERIES.forEach(function (queryType) {
		DomElement[queryType] = function (selector) {
			// TODO tiny query factory, better do some error handling?
			var queryStrategy = QueryStrategyFactory.create(queryType, this.el, selector),
				query = Object.create(DomQuery);

			query.init(queryStrategy);
			return LiveNodeList(query);
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
},{"./LiveNodeList":4,"./domQueries/DomQuery":5,"./domQueries/QueryStrategyFactory":6,"./util/constants":8,"./util/helper":9}],4:[function(require,module,exports){
var smokesignals     = require('smokesignals'),
		constants        = require('./util/constants'),
		helper           = require('./util/helper'),
		NativeObserver   = require('./observers/NativeObserver'),
		IntervalObserver = function () {
		};

// The one and only local instance of a mutation observer
var mutationObserver = Object.create(helper.hasMutationObserver ? NativeObserver : IntervalObserver);


var diff = function (target, other) {
	return target.filter(function (element) {
		return !helper.arrayContains(other, element);
	});
};

mutationObserver.init();

// LiveNodeList is an array like object
var LiveNodeList = {

	__name__: 'LiveNodeList',

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
			this._bubble(constants.CUSTOM_EVENT_ON_ELEMENTS_CHANGED, currentElements);
		}
		if (wasAdded) {
			this._bubble(constants.CUSTOM_EVENT_ON_ELEMENTS_ADDED, addedElements);
		}
		if (wasRemoved) {
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
	forEach: function () {
		Array.prototype.forEach.apply(this, arguments);
	},
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


module.exports = function (elementQuery) {
	if (this instanceof module.exports) {
		throw new Error('The LiveNodeList is a factory function, not a constructor. Don\'t use the new keyword with it');
	}

	var nodeList = Object.create(LiveNodeList);
	nodeList.init(elementQuery);
	return nodeList;
};
},{"./observers/NativeObserver":7,"./util/constants":8,"./util/helper":9,"smokesignals":1}],5:[function(require,module,exports){
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
},{"../util/helper":9}],6:[function(require,module,exports){
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

module.exports = {
	create: function (strategyType, element, selector) {
		//console.time("query");
		//console.log("executing query: ", strategyType + "("+selector+")");
		//var result = strategies[strategyType](element, selector);
		//console.timeEnd("query");
		//return result;
		return strategies[strategyType](element, selector);
	}
};
},{"../util/constants":8,"../util/helper":9}],7:[function(require,module,exports){
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
},{"../util/constants":8,"../util/helper":9,"smokesignals":1}],8:[function(require,module,exports){

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
},{}],9:[function(require,module,exports){
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
},{"./constants":8}],10:[function(require,module,exports){
var DomElement = require('./DomElement');

var watched = function (element) {
	if (this instanceof watched) {
		throw new Error('watched is a factory function, not a constructor. Don\'t use the new keyword with it');
	}

	// a string will be used as a querySelectorAll shortcut on the document element
	if (typeof element === 'string') {
		return DomElement(document).querySelectorAll(element);
	} else {
		return DomElement(element);
	}
};

module.exports = watched;
},{"./DomElement":3}]},{},[10])(10)
});