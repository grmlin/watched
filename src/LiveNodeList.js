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