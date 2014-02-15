var LiveNodeList = (function () {

	// The one and only instance of a mutation observer, initialized on document ready
	var mutationObserver = (function () {
				return new (hasMutationObserver ? NativeObserver : IntervalObserver)();
			}()),
			diff = function (target, other) {
				return target.filter(function (element) {
					return !arrayContains(element, other);
				});
			};

	// initialize the mutation observer when the dom is complete
	ready(mutationObserver.initialize.bind(mutationObserver));

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
						addedElements, removedElements;

				// 1. find all the added elements
				addedElements = diff(currentElements, oldElements);

				// 2. find all the removed elements
				removedElements = diff(oldElements, currentElements);

				// 3. update the nodelist array
				this._updateArray(currentElements);

				this._bubble(CUSTOM_EVENT_ON_ELEMENTS_ADDED, addedElements);
				this._bubble(CUSTOM_EVENT_ON_ELEMENTS_REMOVED, removedElements);
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
				if (elementList.length > 0) {
					this.emit(eventType, elementList);
				}
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
