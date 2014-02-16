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
				this.forEach(function (el, index) {
					delete this[index];
				}, this);
				this.length = 0;
			}
		},
		_bubble: {
			value: function (eventType, elementList) {
				this.emit(eventType, elementList);
			}
		},
		changed: {
			value: function(callback) {
				this.on(CUSTOM_EVENT_ON_ELEMENTS_CHANGED, callback);
			}
		},
		added: {
			value: function (callback) {
				this.on(CUSTOM_EVENT_ON_ELEMENTS_ADDED, callback);
			}
		},
		removed: {
			value: function (callback) {
				this.on(CUSTOM_EVENT_ON_ELEMENTS_REMOVED, callback);
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
			}
		},
		splice: {
			value: function () {}
		}
	});

	return LiveNodeList;
}());
