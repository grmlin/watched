(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.watched = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./domQueries/QueryStrategyFactory":3,"./util/constants":4,"./util/helper":5}],2:[function(require,module,exports){
var DomElement = require('../DomElement');

describe('DomElement', function () {

	it('is a factory function, not a constructor', function () {
		expect(DomElement).to.be.a('function');
		expect(function () {
			var domElement = new DomElement(document);
		}).to.throwError();
	});

	it('wraps dom elements', function(){
		//domEl.init(document);

		expect(function () {
			DomElement('');
		}).to.throwError();

		expect(function () {
			DomElement();
		}).to.throwError();

		expect(function () {
			DomElement({});
		}).to.throwError();

		expect(function () {
			DomElement('foobar');
		}).to.throwError();

		expect(DomElement(document)).to.be.an('object');
		expect(DomElement(document).el).to.equal(document);
	});

	it('creates instances', function(){
		expect(DomElement(document)).to.not.equal(DomElement(document));
	});

	it('provides query selectors', function(){
		var el = DomElement(document);

		expect(el.querySelectorAll).to.be.a('function');
		expect(el.querySelector).to.be.a('function');
		expect(el.getElementsByTagName).to.be.a('function');
		expect(el.getElementsByClassName).to.be.a('function');

	});


});

},{"../DomElement":1}],3:[function(require,module,exports){
var constants = require('../util/constants'),
	helper = require('../util/helper'),
	strategies = {};

// element.querySelectorAll
strategies[constants.queries.QUERY_SELECTOR_ALL] = function (element, selector) {
	return function () {
		var nodeList = element[constants.queries.QUERY_SELECTOR_ALL](selector);
		return helper.nodeListToArray(nodeList);
	}
};

// element.querySelector
strategies[constants.queries.QUERY_SELECTOR] = function (element, selector) {
	return function () {
		var node = element[constants.queries.QUERY_SELECTOR](selector);
		return node === null ? [] : [node];
	}
};

// element.getElementsByTagName
strategies[constants.queries.GET_ELEMENTS_BY_TAG_NAME] = function (element, tagName) {
	// a live list, has to be called once, only
	var nodeList = element[constants.queries.GET_ELEMENTS_BY_TAG_NAME](tagName);
	return function () {
		return helper.nodeListToArray(nodeList);
	}
};

// element.getElementsByTagName
strategies[constants.queries.GET_ELEMENTS_BY_CLASS_NAME] = function (element, className) {
	// a live list, has to be called once, only
	var nodeList = element[constants.queries.GET_ELEMENTS_BY_CLASS_NAME](className);
	return function () {
		return helper.nodeListToArray(nodeList);
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
},{"../util/constants":4,"../util/helper":5}],4:[function(require,module,exports){

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
},{}],5:[function(require,module,exports){
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
},{"./constants":4}]},{},[2])(2)
});
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
var smokesignals = require('smokesignals'),
	constants = require('./util/constants'),
	helper = require('./util/helper'),
	NativeObserver = function(){},
	IntervalObserver = function(){};

// The one and only local instance of a mutation observer
var mutationObserver = new (helper.hasMutationObserver ? NativeObserver : IntervalObserver)(),
	diff = function (target, other) {
		return target.filter(function (element) {
			return !helper.arrayContains(element, other);
		});
	};


// LiveNodeList is an array like object, not inheriting from array
var LiveNodeList = {
	init: function (elementQuery) {
		this._isActive = false;
		this._length = 0;
		this._query = elementQuery;
		this._onMutateHandler = this._onMutate.bind(this);
		this.resume();
	},
	_onMutate: function () {
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
		this._isActive = FALSE;
		mutationObserver.off(CUSTOM_EVENT_ON_MUTATION, this._onMutateHandler);
	},
	resume: function () {
		if (!this._isActive) {
			this._isActive = TRUE;
			this._updateArray(this._query.current());
			mutationObserver.on(CUSTOM_EVENT_ON_MUTATION, this._onMutateHandler);
		}
	},
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


module.exports = function(elementQuery){
	var nodeList = Object.create(LiveNodeList);
	nodeList.init(elementQuery);
	return nodeList;
};
},{"./util/constants":5,"./util/helper":6,"smokesignals":1}],4:[function(require,module,exports){
var LiveNodeList = require('../LiveNodeList');

describe('LiveNodeList', function () {

	it('is a factory function, not a constructor', function () {

	});


});

},{"../LiveNodeList":3}],5:[function(require,module,exports){

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
},{}],6:[function(require,module,exports){
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
},{"./constants":5}]},{},[4])(4)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.watched = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./domQueries/QueryStrategyFactory":3,"./util/constants":4,"./util/helper":5}],2:[function(require,module,exports){
var watched = require('../watched');

describe('watched namespace', function () {

	it('exposes a public interface', function () {
		expect(watched).to.be.a('function');
		expect(function () {
			var w = new watched(document);
		}).to.throwError();
	});

	//it('creates a DomElement and LiveNodeList instances', function () {
	//	expect(watched(document)).to.be.a(DomElement);
	//	expect(watched('.dom-element-quick-test')).to.be.a(LiveNodeList);
	//	expect(function () {
	//		watched({});
	//	}).to.throwError();
	//	expect(function () {
	//		watched(123);
	//	}).to.throwError();
	//	expect(function () {
	//		watched();
	//	}).to.throwError();
	//});
});
},{"../watched":6}],3:[function(require,module,exports){
var constants = require('../util/constants'),
	helper = require('../util/helper'),
	strategies = {};

// element.querySelectorAll
strategies[constants.queries.QUERY_SELECTOR_ALL] = function (element, selector) {
	return function () {
		var nodeList = element[constants.queries.QUERY_SELECTOR_ALL](selector);
		return helper.nodeListToArray(nodeList);
	}
};

// element.querySelector
strategies[constants.queries.QUERY_SELECTOR] = function (element, selector) {
	return function () {
		var node = element[constants.queries.QUERY_SELECTOR](selector);
		return node === null ? [] : [node];
	}
};

// element.getElementsByTagName
strategies[constants.queries.GET_ELEMENTS_BY_TAG_NAME] = function (element, tagName) {
	// a live list, has to be called once, only
	var nodeList = element[constants.queries.GET_ELEMENTS_BY_TAG_NAME](tagName);
	return function () {
		return helper.nodeListToArray(nodeList);
	}
};

// element.getElementsByTagName
strategies[constants.queries.GET_ELEMENTS_BY_CLASS_NAME] = function (element, className) {
	// a live list, has to be called once, only
	var nodeList = element[constants.queries.GET_ELEMENTS_BY_CLASS_NAME](className);
	return function () {
		return helper.nodeListToArray(nodeList);
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
},{"../util/constants":4,"../util/helper":5}],4:[function(require,module,exports){

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
},{}],5:[function(require,module,exports){
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
},{"./constants":4}],6:[function(require,module,exports){
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
},{"./DomElement":1}]},{},[2])(2)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.watched = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var constants = require('../util/constants'),
	helper = require('../util/helper'),
	strategies = {};

// element.querySelectorAll
strategies[constants.queries.QUERY_SELECTOR_ALL] = function (element, selector) {
	return function () {
		var nodeList = element[constants.queries.QUERY_SELECTOR_ALL](selector);
		return helper.nodeListToArray(nodeList);
	}
};

// element.querySelector
strategies[constants.queries.QUERY_SELECTOR] = function (element, selector) {
	return function () {
		var node = element[constants.queries.QUERY_SELECTOR](selector);
		return node === null ? [] : [node];
	}
};

// element.getElementsByTagName
strategies[constants.queries.GET_ELEMENTS_BY_TAG_NAME] = function (element, tagName) {
	// a live list, has to be called once, only
	var nodeList = element[constants.queries.GET_ELEMENTS_BY_TAG_NAME](tagName);
	return function () {
		return helper.nodeListToArray(nodeList);
	}
};

// element.getElementsByTagName
strategies[constants.queries.GET_ELEMENTS_BY_CLASS_NAME] = function (element, className) {
	// a live list, has to be called once, only
	var nodeList = element[constants.queries.GET_ELEMENTS_BY_CLASS_NAME](className);
	return function () {
		return helper.nodeListToArray(nodeList);
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
},{"../util/constants":3,"../util/helper":4}],2:[function(require,module,exports){
var QueryStrategyFactory = require('../QueryStrategyFactory');

describe('QueryStrategyFactory', function () {

	it('can create query strategies', function () {
		expect(QueryStrategyFactory.create).to.be.a('function');
	});

	it('uses querySelectorAll', function(){
		var query = QueryStrategyFactory.create('querySelectorAll', document, '.query-strategy-test');

		expect(query).to.be.a('function');
		expect(query()).to.be.an('array');
		expect(query()).to.have.length(4);

	});


	it('uses querySelector', function(){
		var query = QueryStrategyFactory.create('querySelector', document, '.query-strategy-test');

		expect(query).to.be.a('function');
		expect(query()).to.be.an('array');
		expect(query()).to.have.length(1);

	});

	it('uses getElementsByTagName', function(){
		var query = QueryStrategyFactory.create('getElementsByTagName', document, 'body');

		expect(query).to.be.a('function');
		expect(query()).to.be.an('array');
		expect(query()).to.have.length(1);

	});

	it('uses getElementsByClassName', function(){
		var query = QueryStrategyFactory.create('getElementsByClassName', document, 'query-strategy-test');

		expect(query).to.be.a('function');
		expect(query()).to.be.an('array');
		expect(query()).to.have.length(4);

	});


});
},{"../QueryStrategyFactory":1}],3:[function(require,module,exports){

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
},{}],4:[function(require,module,exports){
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
},{"./constants":3}]},{},[2])(2)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.watched = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var constants = require('../constants');

describe('constants', function () {
	it('the event names are set correctly ', function () {
		expect(constants.CUSTOM_EVENT_ON_ELEMENTS_ADDED).to.equal('added');
		expect(constants.CUSTOM_EVENT_ON_ELEMENTS_REMOVED).to.equal('removed');
		expect(constants.CUSTOM_EVENT_ON_ELEMENTS_CHANGED).to.equal('changed');
	});

	it('gives us multiple query selectors', function(){
		var queries = constants.queries;
		expect(queries).to.be.an('object');
		expect(queries).to.have.property('QUERY_SELECTOR_ALL', 'querySelectorAll');
		expect(queries).to.have.property('QUERY_SELECTOR', 'querySelector');
		expect(queries).to.have.property('GET_ELEMENTS_BY_TAG_NAME', 'getElementsByTagName');
		expect(queries).to.have.property('GET_ELEMENTS_BY_CLASS_NAME', 'getElementsByClassName');

		expect(constants.AVAILABLE_QUERIES).to.be.an('array');
		expect(constants.AVAILABLE_QUERIES).to.eql([queries.QUERY_SELECTOR_ALL, queries.QUERY_SELECTOR, queries.GET_ELEMENTS_BY_TAG_NAME, queries.GET_ELEMENTS_BY_CLASS_NAME]);
	});

	//it('creates a DomElement and LiveNodeList instances', function () {
	//	expect(watched(document)).to.be.a(DomElement);
	//	expect(watched('.dom-element-quick-test')).to.be.a(LiveNodeList);
	//	expect(function () {
	//		watched({});
	//	}).to.throwError();
	//	expect(function () {
	//		watched(123);
	//	}).to.throwError();
	//	expect(function () {
	//		watched();
	//	}).to.throwError();
	//});
});
},{"../constants":2}],2:[function(require,module,exports){

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
},{}]},{},[1])(1)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.watched = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var helper = require('../helper');

describe('helpers', function () {
	it('provides helper properties ', function () {
		expect(helper.hasMutationObserver).to.be.a('boolean');
	});

	it('checks dom elements', function () {
		expect(helper.isInvalidDomElement).to.be.a('function');
		expect(helper.isInvalidDomElement(document)).to.not.be.ok();
		expect(helper.isInvalidDomElement()).to.be.ok();
		expect(helper.isInvalidDomElement(null)).to.be.ok();
		expect(helper.isInvalidDomElement(true)).to.be.ok();
		expect(helper.isInvalidDomElement(false)).to.be.ok();
		expect(helper.isInvalidDomElement('foobar')).to.be.ok();
		expect(helper.isInvalidDomElement('')).to.be.ok();
	});

	it('converts node lists to arrays', function () {
		var nodeList      = document.querySelectorAll('.node-list-test'),
				nodeListArray = helper.nodeListToArray(nodeList);

		expect(nodeListArray).to.be.an('array');
		expect(nodeListArray).to.have.length(8);
	});

	it('checks for elements in an array', function () {
		var a = [1, 2, '3', null];
		expect(helper.arrayContains(a, 1)).to.be.ok();
		expect(helper.arrayContains(a, 2)).to.be.ok();
		expect(helper.arrayContains(a, 3)).to.not.be.ok();
		expect(helper.arrayContains(a, '3')).to.be.ok();
		expect(helper.arrayContains(a, null)).to.be.ok();
		expect(helper.arrayContains(a, 'foo')).to.not.be.ok();
		expect(helper.arrayContains(a)).to.not.be.ok();
	});

	it('clones arrays', function () {
		var a     = [1, 2, 3],
				clone = helper.arrayClone(a);

		expect(clone).to.be.an('array');
		expect(clone).to.not.equal(a);
		expect(clone).to.eql(a);
	});

	it('can debounce functions', function (done) {
		var i         = 0,
				debounced = helper.debounce(function () {
					i++;

					try {
						expect(i).to.equal(1);
						done();
					} catch (e) {
						done(e);
					}
				}, 100);

		debounced();
		setTimeout(function () {
			debounced();
		}, 10);


	});

});
},{"../helper":3}],2:[function(require,module,exports){

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
},{}],3:[function(require,module,exports){
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
},{"./constants":2}]},{},[1])(1)
});