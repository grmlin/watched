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
},{"./LiveNodeList":4,"./domQueries/DomQuery":6,"./domQueries/QueryStrategyFactory":7,"./util/constants":9,"./util/helper":10}],4:[function(require,module,exports){
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
},{"./observers/NativeObserver":8,"./util/constants":9,"./util/helper":10,"smokesignals":1}],5:[function(require,module,exports){
var DomElement = require('../DomElement');

describe('DomElement', function () {

	it('is a factory function, not a constructor', function () {
		expect(DomElement).to.be.a('function');
		expect(function () {
			var domElement = new DomElement(document);
		}).to.throwError();
	});

	it('wraps dom elements', function () {
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

	it('creates instances', function () {
		expect(DomElement(document)).to.not.equal(DomElement(document));
	});

	it('provides query selectors', function () {
		var el = DomElement(document);

		expect(el.querySelectorAll).to.be.a('function');
		expect(el.querySelector).to.be.a('function');
		expect(el.getElementsByTagName).to.be.a('function');
		expect(el.getElementsByClassName).to.be.a('function');

	});

	// ------------------

	var element = DomElement(document);

	it('returns LiveNodeLists', function () {
		expect(element.querySelectorAll('.dom-element-test')).to.have.property('__name__', 'LiveNodeList');
		expect(element.querySelector('.dom-element-test')).to.have.property('__name__', 'LiveNodeList');
		expect(element.getElementsByTagName('script')).to.have.property('__name__', 'LiveNodeList');
		expect(element.getElementsByClassName('.dom-element-test')).to.have.property('__name__', 'LiveNodeList');
	});








});

},{"../DomElement":3}],6:[function(require,module,exports){
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
},{"../util/helper":10}],7:[function(require,module,exports){
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
},{"../util/constants":9,"../util/helper":10}],8:[function(require,module,exports){
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
},{"../util/constants":9,"../util/helper":10,"smokesignals":1}],9:[function(require,module,exports){

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
},{}],10:[function(require,module,exports){
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
},{"./constants":9}]},{},[5])(5)
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
},{"./LiveNodeList":4,"./domQueries/DomQuery":6,"./domQueries/QueryStrategyFactory":7,"./util/constants":9,"./util/helper":10}],4:[function(require,module,exports){
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
},{"./observers/NativeObserver":8,"./util/constants":9,"./util/helper":10,"smokesignals":1}],5:[function(require,module,exports){
var LiveNodeList = require('../LiveNodeList');
var DomElement = require('../DomElement');

describe('LiveNodeList', function () {
	this.timeout(5000);

	var CSS_CLASS = "livenodelist-test";
	var element = DomElement(document);
	var list = element.querySelectorAll('.' + CSS_CLASS);

	it('has a public interface', function () {
		expect(list.pause).to.be.a('function');
		expect(list.resume).to.be.a('function');
		expect(list.on).to.be.a('function');
		expect(list.off).to.be.a('function');
		expect(list.forEach).to.be.a('function');
		expect(list.length).to.be.a('number');
	});

	it('finds elements that are already in the dom', function () {
		var el1 = document.createElement('div'),
				el2 = document.createElement('div'),
				el3 = document.createElement('div');

		el1.className = "finds-existing";
		el2.className = "finds-existing";
		el3.className = "finds-existing";

		document.body.appendChild(el1);
		document.body.appendChild(el2);
		document.body.appendChild(el3);

		var list1 = element.querySelectorAll('.finds-existing');
		expect(list1.length).to.equal(3);
	});

	it('knows the length', function () {
		var el1 = document.createElement('div'),
				el2 = document.createElement('div'),
				el3 = document.createElement('div');

		el1.className = "knows-the-length";
		el2.className = "knows-the-length";
		el3.className = "knows-the-length";

		document.body.appendChild(el1);
		document.body.appendChild(el2);
		document.body.appendChild(el3);

		var list2 = element.querySelectorAll('.knows-the-length');
		expect(list2.length).to.equal(3);
	});

	it('detects dom additions', function (done) {
		var el = document.createElement('div');
		el.className = CSS_CLASS;

		list.on('added', function (newElements) {
			try {
				expect(list.length).to.equal(1);
				expect(newElements.length).to.equal(1);
				expect(newElements[0]).to.equal(el);
				expect(list[0]).to.equal(el);
				done();
			} catch (e) {
				done(e);
			}
		});

		setTimeout(function () {
			document.body.appendChild(el);
		}, 10);
	});

	it('detects dom deletions', function (done) {
		var el = document.querySelector('.' + CSS_CLASS);

		list.on('removed', function (removedElements) {
			try {
				expect(list.length).to.equal(0);
				expect(removedElements.length).to.equal(1);
				expect(removedElements[0]).to.equal(el);
				done();
			} catch (e) {
				done(e);
			}
		});

		el.parentNode.removeChild(el);
	});

	it('detects dom changes in general', function (done) {
		var CSS_CLASS_2 = "another-" + CSS_CLASS;
		var list = element.querySelectorAll('.' + CSS_CLASS_2);
		var el2 = document.createElement('div');
		var times = 0;
		el2.className = CSS_CLASS_2;

		list.on('changed', function (currentElements) {
			try {
				//added
				if (times === 0) {
					expect(list.length).to.equal(1);
					expect(currentElements.length).to.equal(1);
					expect(currentElements[0]).to.equal(el2);
					expect(list[0]).to.equal(el2);

					times++;
					el2.parentNode.removeChild(el2);
				}
				//removed
				else if (times === 1) {
					expect(list.length).to.equal(0);
					expect(currentElements.length).to.equal(0);
					done();
				}

			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(el2);

	});

	it('detects changes in batches', function (done) {

		var CSS_CLASS_2 = "detects-changes-in-batches";
		var list = element.querySelectorAll('.' + CSS_CLASS_2);
		var times = 0;

		var el1 = document.createElement('div'),
				el2 = document.createElement('div'),
				el3 = document.createElement('div');

		el1.className = CSS_CLASS_2;
		el2.className = CSS_CLASS_2;
		el3.className = CSS_CLASS_2;

		el2.className = CSS_CLASS_2;

		list.on('added', function (newElements) {
			try {
				expect(times).to.equal(0);
				expect(list.length).to.equal(3);
				expect(newElements.length).to.equal(3);
				expect(newElements).to.contain(el1);
				expect(newElements).to.contain(el2);
				expect(newElements).to.contain(el3);
				expect(list).to.contain(el1);
				expect(list).to.contain(el2);
				expect(list).to.contain(el3);
				el1.parentNode.removeChild(el1);
				el3.parentNode.removeChild(el3);
				times++;
			} catch (e) {
				done(e);
			}

		});

		list.on('removed', function (removedElements) {
			try {
				expect(times).to.equal(1);
				expect(list.length).to.equal(1);
				expect(removedElements.length).to.equal(2);
				expect(removedElements).to.contain(el1);
				expect(removedElements).to.contain(el3);
				expect(list).to.contain(el2);
				done();
			} catch (e) {
				done(e);
			}
		});

		list.on('changed', function (currentElements) {
			try {
				if (times === 0) {
					expect(list.length).to.equal(3);
					expect(currentElements.length).to.equal(3);
					expect(currentElements).to.contain(el1);
					expect(currentElements).to.contain(el2);
					expect(currentElements).to.contain(el3);
					expect(list).to.contain(el1);
					expect(list).to.contain(el2);
					expect(list).to.contain(el3);
				} else if (times === 1) {
					expect(list.length).to.equal(1);
					expect(list).to.contain(el2);
				}
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(el1);
		document.body.appendChild(el2);
		document.body.appendChild(el3);

	});

	it('can pause the live nodelist', function (done) {
		var CSS_CLASS_2 = "can-pause-the-live-nodelist";
		var list = element.querySelectorAll('.' + CSS_CLASS_2);
		var times = 0;

		var el1 = document.createElement('div'),
				el2 = document.createElement('div'),
				el3 = document.createElement('div');

		el1.className = CSS_CLASS_2;
		el2.className = CSS_CLASS_2;
		el3.className = CSS_CLASS_2;

		list.on('added', function (addeElements) {
			try {
				if (times === 0) {
					expect(list.length).to.equal(1);
					expect(list[0]).to.equal(el1);

					// pause
					times++;
					list.pause();
					document.body.appendChild(el2);
					setTimeout(function(){
						list.resume();
						document.body.appendChild(el3);
					}, 1000);
				} else if (times === 1) {
					expect(list.length).to.equal(3);
					expect(list).to.contain(el1);
					expect(list).to.contain(el2);
					expect(list).to.contain(el3);
					times++;
					done();
				} else if (times === 2) {
					throw new Error("Didn't pause");
				}

			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(el1);
	});
});

},{"../DomElement":3,"../LiveNodeList":4}],6:[function(require,module,exports){
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
},{"../util/helper":10}],7:[function(require,module,exports){
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
},{"../util/constants":9,"../util/helper":10}],8:[function(require,module,exports){
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
},{"../util/constants":9,"../util/helper":10,"smokesignals":1}],9:[function(require,module,exports){

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
},{}],10:[function(require,module,exports){
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
},{"./constants":9}]},{},[5])(5)
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
},{"./LiveNodeList":4,"./domQueries/DomQuery":6,"./domQueries/QueryStrategyFactory":7,"./util/constants":9,"./util/helper":10}],4:[function(require,module,exports){
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
},{"./observers/NativeObserver":8,"./util/constants":9,"./util/helper":10,"smokesignals":1}],5:[function(require,module,exports){
var watched = require('../watched');

describe('watched: public method', function () {

	it('exposes a factory function', function () {
		expect(watched).to.be.a('function');
		expect(function () {
			var w = new watched(document);
		}).to.throwError();
	});

	it('the factory creates DomElement and LiveNodeList instances', function () {
		expect(watched(document)).to.have.property('__name__', 'DomElement');
		;
		expect(watched('.dom-element-quick-test')).to.have.property('__name__', 'LiveNodeList');
		expect(function () {
			watched({});
		}).to.throwError();
		expect(function () {
			watched(123);
		}).to.throwError();
		expect(function () {
			watched();
		}).to.throwError();
	});


});

describe('watched: added event', function () {
	var classname,
			wrapper,
			inside,
			outside;

	beforeEach(function () {
		classname = "supports-" + this.currentTest.title;
		wrapper = document.createElement('div');
		inside = document.createElement('div');
		outside = document.createElement('div');

		inside.className = classname;
		outside.className = classname;

		document.body.appendChild(wrapper);
	});

	it('querySelectorAll', function (done) {

		var list = watched(wrapper).querySelectorAll("." + classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(1);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.not.contain(outside);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
	});

	it('querySelector', function (done) {

		var list = watched(wrapper).querySelector("." + classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(1);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.not.contain(outside);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
	});

	it('getElementsByTagName', function (done) {
		var inside        = document.createElement('span'),
				inside2       = document.createElement('span'),
				insideInvalid = document.createElement('div'),
				outside       = document.createElement('span');

		var list = watched(wrapper).getElementsByTagName("span");
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(2);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.contain(inside2);
				expect(addedElements).to.not.contain(outside);
				expect(addedElements).to.not.contain(insideInvalid);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
		wrapper.appendChild(insideInvalid);
	});

	it('getElementsByClassName', function (done) {
		var inside2       = document.createElement('div'),
				insideInvalid = document.createElement('div');

		inside2.className = classname;
		insideInvalid.className = classname + "-NOT";

		var list = watched(wrapper).getElementsByClassName(classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(2);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.contain(inside2);
				expect(addedElements).to.not.contain(outside);
				expect(addedElements).to.not.contain(insideInvalid);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
		wrapper.appendChild(insideInvalid);
	});

});

describe('watched: added event', function () {
	var classname,
			wrapper,
			inside,
			outside;

	beforeEach(function () {
		classname = "supports-" + this.currentTest.title;
		wrapper = document.createElement('div');
		inside = document.createElement('div');
		outside = document.createElement('div');

		inside.className = classname;
		outside.className = classname;

		document.body.appendChild(wrapper);
	});

	it('querySelectorAll', function (done) {

		var list = watched(wrapper).querySelectorAll("." + classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(1);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.not.contain(outside);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
	});

	it('querySelector', function (done) {

		var list = watched(wrapper).querySelector("." + classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(1);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.not.contain(outside);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
	});

	it('getElementsByTagName', function (done) {
		var inside        = document.createElement('span'),
				inside2       = document.createElement('span'),
				insideInvalid = document.createElement('div'),
				outside       = document.createElement('span');

		var list = watched(wrapper).getElementsByTagName("span");
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(2);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.contain(inside2);
				expect(addedElements).to.not.contain(outside);
				expect(addedElements).to.not.contain(insideInvalid);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
		wrapper.appendChild(insideInvalid);
	});

	it('getElementsByClassName', function (done) {
		var inside2       = document.createElement('div'),
				insideInvalid = document.createElement('div');

		inside2.className = classname;
		insideInvalid.className = classname + "-NOT";

		var list = watched(wrapper).getElementsByClassName(classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(2);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.contain(inside2);
				expect(addedElements).to.not.contain(outside);
				expect(addedElements).to.not.contain(insideInvalid);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
		wrapper.appendChild(insideInvalid);
	});

});


describe('watched: changed event', function () {
	var classname,
			wrapper,
			inside,
			outside;

	beforeEach(function () {
		classname = "supports-" + this.currentTest.title;
		wrapper = document.createElement('div');
		inside = document.createElement('div');
		outside = document.createElement('div');

		inside.className = classname;
		outside.className = classname;

		document.body.appendChild(wrapper);
	});


	it('querySelectorAll', function (done) {
		var list = watched(wrapper).querySelectorAll("." + classname);
		list.on('changed', function (currentElements) {
			try {
				list.off('changed');
				expect(list.length).to.equal(1);
				expect(currentElements).to.contain(inside);
				expect(currentElements).to.not.contain(outside);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
	});

	it('querySelector', function (done) {
		var list = watched(wrapper).querySelector("." + classname);
		list.on('changed', function (currentElements) {
			try {
				list.off('changed');
				expect(list.length).to.equal(1);
				expect(currentElements).to.contain(inside);
				expect(currentElements).to.not.contain(outside);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
	});

	it('getElementsByTagName', function (done) {
		var inside        = document.createElement('span'),
				inside2       = document.createElement('span'),
				insideInvalid = document.createElement('div'),
				outside       = document.createElement('span');

		var list = watched(wrapper).getElementsByTagName("span");
		list.on('changed', function (currentElements) {
			try {
				list.off('changed');
				expect(list.length).to.equal(2);
				expect(currentElements).to.contain(inside);
				expect(currentElements).to.contain(inside2);
				expect(currentElements).to.not.contain(outside);
				expect(currentElements).to.not.contain(insideInvalid);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
		wrapper.appendChild(insideInvalid);
	});

	it('getElementsByClassName', function (done) {
		var inside2       = document.createElement('div'),
				insideInvalid = document.createElement('div');

		inside2.className = classname;
		insideInvalid.className = classname + "-NOT";

		var list = watched(wrapper).getElementsByClassName(classname);
		list.on('changed', function (currentElements) {
			try {
				list.off('changed');
				expect(list.length).to.equal(2);
				expect(currentElements).to.contain(inside);
				expect(currentElements).to.contain(inside2);
				expect(currentElements).to.not.contain(outside);
				expect(currentElements).to.not.contain(insideInvalid);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
		wrapper.appendChild(insideInvalid);
	});

});


describe('watched: removed event', function () {
	var classname,
			wrapper,
			inside,
			outside;

	beforeEach(function () {
		classname = "supports-" + this.currentTest.title;
		wrapper = document.createElement('div');
		inside = document.createElement('div');
		outside = document.createElement('div');

		inside.className = classname;
		outside.className = classname;

		document.body.appendChild(wrapper);
	});


	it('querySelectorAll', function (done) {
		var list = watched(wrapper).querySelectorAll("." + classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(1);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.not.contain(outside);
				wrapper.removeChild(inside);
			} catch (e) {
				done(e);
			}
		}).on('removed', function (removedElements) {
			try {
				expect(list.length).to.equal(0);
				expect(removedElements).to.contain(inside);
				expect(list).to.not.contain(inside);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
	});
});


describe('watched: events can be dismissed', function () {
	var classname,
			wrapper,
			inside,
			inside2;

	beforeEach(function () {
		classname = "supports-" + this.currentTest.title;
		wrapper = document.createElement('div');
		inside = document.createElement('div');
		inside2 = document.createElement('div');

		inside.className = classname;
		inside2.className = classname;

		document.body.appendChild(wrapper);
	});


	it('querySelectorAll', function (done) {
		var eventCount = 0;
		var list = watched(wrapper).querySelectorAll("." + classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				eventCount++;
				expect(list.length).to.be(1);
				wrapper.appendChild(inside2);

				//wrapper.removeChild(inside);
			} catch (e) {
				done(e);
			}
		}).on('removed', function (removedElements) {
			try {
				expect(list.length).to.equal(0);
				expect(removedElements).to.contain(inside);
				expect(list).to.not.contain(inside);
				done();
			} catch (e) {
				done(e);
			}
		});

		setTimeout(function () {
			done();
		}, 1500);

		wrapper.appendChild(inside);
	});
});


describe('watched: recognizes parent element removal', function () {
	var classname,
			wrapper,
			inside,
			inside2;

	beforeEach(function () {
		classname = "parent-removed-" + this.currentTest.title;
		wrapper = document.createElement('div');
		inside = document.createElement('div');
		inside2 = document.createElement('div');

		inside.className = classname;
		inside2.className = classname;

		document.body.appendChild(wrapper);
	});


	it('querySelectorAll', function (done) {
		var list = watched(wrapper).querySelectorAll("." + classname);
		var timesAdded = 0;

		list.on('added', function (addedElements) {
			try {
				timesAdded++;
				expect(list.length).to.equal(2);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.contain(inside2);

				if (timesAdded === 1) {
					wrapper.parentElement.removeChild(wrapper);
				} else if (timesAdded === 2) {
					done();
				}
			} catch (e) {
				done(e);
			}
		}).on('removed', function (removedElements) {
			try {
				expect(list.length).to.equal(0);
				expect(removedElements).to.contain(inside);
				expect(list).to.not.contain(inside);
				document.body.appendChild(wrapper);
			} catch (e) {
				done(e);
			}
		});

		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
	});
});


describe('watched: elements can be removed and added again', function () {
	var classname,
			wrapper,
			inside,
			inside2;

	beforeEach(function () {
		classname = "parent-readded-" + this.currentTest.title;
		wrapper = document.createElement('div');
		inside = document.createElement('div');
		inside2 = document.createElement('div');

		inside.className = classname;
		inside2.className = classname;

		document.body.appendChild(wrapper);
	});


	it('querySelectorAll', function (done) {
		var list = watched(wrapper).querySelectorAll("." + classname);
		var timesAdded = 0;

		list.on('added', function (addedElements) {
			try {
				timesAdded++;
				expect(list.length).to.equal(2);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.contain(inside2);

				if (timesAdded === 1) {
					wrapper.removeChild(inside);
					wrapper.removeChild(inside2);
				} else if (timesAdded === 2) {
					done();
				}
			} catch (e) {
				done(e);
			}
		}).on('removed', function (removedElements) {
			try {
				expect(list.length).to.equal(0);
				expect(removedElements).to.contain(inside);
				expect(list).to.not.contain(inside);
				wrapper.appendChild(inside);
				wrapper.appendChild(inside2);
			} catch (e) {
				done(e);
			}
		});

		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
	});
});
},{"../watched":11}],6:[function(require,module,exports){
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
},{"../util/helper":10}],7:[function(require,module,exports){
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
},{"../util/constants":9,"../util/helper":10}],8:[function(require,module,exports){
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
},{"../util/constants":9,"../util/helper":10,"smokesignals":1}],9:[function(require,module,exports){

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
},{}],10:[function(require,module,exports){
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
},{"./constants":9}],11:[function(require,module,exports){
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
},{"./DomElement":3}]},{},[5])(5)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.watched = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"../util/helper":4}],2:[function(require,module,exports){
var DomQuery = require('../DomQuery');

describe('DomQuery', function () {

	it('it wraps query strategies', function () {
		expect(DomQuery).to.be.an('object');
		expect(DomQuery.init).to.a('function');
		expect(DomQuery.old).to.a('function');
		expect(DomQuery.current).to.a('function');
	});


});
},{"../DomQuery":1}],3:[function(require,module,exports){

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