var smokesignals = require('smokesignals'),
	constants = require('./util/constants'),
	helper = require('./util/helper'),
	DomQuery = require('./domQueries/DomQuery'),
	NativeObserver = require('./observers/NativeObserver'),
	IntervalObserver = require('./observers/IntervalObserver');

// The one and only local instance of a mutation observer
var mutationObserver = Object.create(helper.hasMutationObserver ? NativeObserver : IntervalObserver);
mutationObserver.init();

/**
 * smokesignals event emitter
 *
 * @external smokesignals
 * @namespace external:smokesignals
 * @see {@link https://bitbucket.org/bentomas/smokesignals.js}
 */


/**
 * @Module LiveNodeList
 */


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
 * A live list of dom elements, always up to date.
 *
 * It's a live list, similar to the list returned by `getElementsBy(Tag|Class)Name`. But other than these queries,
 * the `LiveNodeList` dispatches event on changes!
 *
 * @namespace module:LiveNodeList~LiveNodeList
 * @mixes smokesignals
 * @see {@link https://bitbucket.org/bentomas/smokesignals.js|smokesignals} for the event emitter library mixed into
 * `LiveNodeList`.
 * @fires module:LiveNodeList~LiveNodeList#changed
 * @fires module:LiveNodeList~LiveNodeList#added
 * @fires module:LiveNodeList~LiveNodeList#removed
 */
var LiveNodeList = {
	/**
	 * name helper, mainly used for tests
	 * @private
	 * @instance
	 * */
	__name__: 'LiveNodeList',

	/**
	 * Initialize the LiveNodeList
	 * @param {DomQuery} elementQuery
	 * @instance
	 */
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
			/**
			 * LiveNodeList event
			 *
			 * Event called when new elements are added to or removed from the dom
			 *
			 * The event listeners callback will be called with one argument: an array containing all elements currently in the list
			 *
			 * @example
			 * nodeList.on('changed', function(currentElements){
			 *   console.log(currentElements);
			 * });
			 *
			 * @event module:LiveNodeList~LiveNodeList#changed
			 * @param {HTMLElement[]} currentElements current elements. These are the same as in the `LiveNodeList`, but in a
			 * native array
			 */
			this._bubble(constants.CUSTOM_EVENT_ON_ELEMENTS_CHANGED, currentElements);
		}
		if (wasAdded) {
			/**
			 * LiveNodeList event
			 * Event called when new elements are added to the dom
			 *
			 * The event listeners callback will be called with one argument: an array containing the newly found dom elements
			 *
			 * @example
			 * nodeList.on('added', function(newElements){
			 *   console.log(newElements);
			 * });
			 *
			 * @event module:LiveNodeList~LiveNodeList#added
			 * @param {HTMLElement[]} addedElements the added elements
			 */
			this._bubble(constants.CUSTOM_EVENT_ON_ELEMENTS_ADDED, addedElements);
		}
		if (wasRemoved) {
			/**
			 * LiveNodeList event
			 * Event called when elements are removed from the dom
			 *
			 * The event listeners callback will be called with one argument: an array `removedElements` containing the dom elements removed from the list (removed from the dom)
			 *
			 * @example
			 * nodeList.on('removed', function(removedElements){
			 *   console.log(removedElements);
			 * });
			 *
			 * @event module:LiveNodeList~LiveNodeList#removed
			 * @param {HTMLElement[]} removedElements elements removed from the `LiveNodeList`
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
	 *
	 * @example
	 * nodeList.forEach(function(element){
	 *   element.style.color = "green";
	 * });
	 *
	 * @param {Function} callback
	 * @param {Object} [thisArg] optional context object
	 *
	 * @instance
	 * */
	forEach: function (callback, thisArg) {
		Array.prototype.forEach.apply(this, arguments);
	},

	/**
	 * Freezes the nodelist in it's current form and pauses the dom mutation listener
	 *
	 * @instance
	 * @example
	 * nodeList.pause();
	 */
	pause: function () {
		this._isActive = false;
		mutationObserver.off(constants.CUSTOM_EVENT_ON_MUTATION, this._onMutateHandler);
	},

	/**
	 * Resume the query and listen to dom mutations again.
	 * Creating a LiveNodeList will do that initially for you.
	 *
	 * @example
	 * nodelist.resume();
	 *
	 * @instance
	 */
	resume: function () {
		if (!this._isActive) {
			this._isActive = true;
			this._updateArray(this._query.current());
			mutationObserver.on(constants.CUSTOM_EVENT_ON_MUTATION, this._onMutateHandler);
		}
	}
};

/**
 * The length of the node list.
 *
 * *you can't set the length, so tricks known to work with the native array won't have any effect here*
 *
 * @member length
 * @memberof module:LiveNodeList~LiveNodeList
 * @type {number}
 * @instance
 */

Object.defineProperty(LiveNodeList, 'length', {
	get: function () {
		return this._length;
	},
	set: function (/*length*/) {
		// Don't delete this one. `Array.prototype.slice.call(this, 0)` may call this setter
	}
});

/**
 * Add an event listener to the LiveNodeList
 *
 * @function on
 * @memberof module:LiveNodeList~LiveNodeList
 * @param {string} eventName The name of the event
 * @param {function} handler a callback function
 * @instance
 */

/**
 * Add an event listener to the LiveNodeList that will only be called **once**
 *
 * @function once
 * @memberof module:LiveNodeList~LiveNodeList
 * @param {string} eventName The name of the event
 * @param {function} handler a callback function
 * @instance
 */

/**
 * Removes an event listener from the LiveNodeList
 *
 * @function off
 * @memberof module:LiveNodeList~LiveNodeList
 * @param {string} eventName The name of the event
 * @param {function} [handler] a callback function
 * @instance
 */

/**
 * Emit an event.
 *
 * Normally you don't do that, but it's part of the `LiveNodeList`'s prototype, so it's documented here
 *
 * @function emit
 * @memberof module:LiveNodeList~LiveNodeList
 * @param {string} eventName The name of the event
 * @param {...*} eventData event data passed into the event callbacks
 * @instance
 */

smokesignals.convert(LiveNodeList);

/**
 * factory method to create new `LiveNodeList` objects
 *
 * @param {Function} queryStrategy a query created with {@link module:domQueries/QueryStrategyFactory.create}
 * @returns {module:LiveNodeList~LiveNodeList}
 */
module.exports = function (queryStrategy) {
	if (this instanceof module.exports) {
		throw new Error('The LiveNodeList is a factory function, not a constructor. Don\'t use the new keyword with it');
	}

	var query = Object.create(DomQuery),
		nodeList = Object.create(LiveNodeList);

	query.init(queryStrategy);
	nodeList.init(query);
	return nodeList;
};


