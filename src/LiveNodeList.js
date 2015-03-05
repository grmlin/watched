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