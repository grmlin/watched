var DomObserver = (function () {
	var isDomReady = false,
			mutationObserver = MutationObserverFactory.createObserver(),
			getElements = function (selector) {
				var nodeList = querySelectorAll(selector);
				return nodeListToArray(nodeList);
			},
			diff = function (target, other) {
				return target.filter(function (element) {
					return !arrayContains(element, other);
				});
			};

	ready(mutationObserver.initialize.bind(mutationObserver));

	var DomObserver = function (selector) {
		smokesignals.convert(this);

		this._selector = selector;
		this._currentElements = [];

		mutationObserver.on(CUSTOM_EVENT_ON_MUTATION, this._onMutate.bind(this));
		ready(this._onMutate.bind(this));
	};

	DomObserver.prototype._onMutate = function () {
		var oldElements = this._currentElements,
				newElements = getElements(this._selector),
				addedElements, removedElements;

		// 1. find all the added elements
		addedElements = diff(newElements, oldElements);

		// 2. find all the removed elements
		removedElements = diff(oldElements, newElements);

		// 3. save the current elements
		this._currentElements = newElements;

		if (addedElements.length > 0) {
			this._bubble(CUSTOM_EVENT_ON_ELEMENTS_ADDED, addedElements);
		}
		if (removedElements.length > 0) {
			this._bubble(CUSTOM_EVENT_ON_ELEMENTS_REMOVED, removedElements);
		}

	};

	DomObserver.prototype._bubble = function (eventType, elementList) {
		this.emit(eventType, arrayClone(elementList), this.elements);
	};

	Object.defineProperty(DomObserver.prototype, 'elements', {
		get: function(){
			return arrayClone(this._currentElements);
		}
	});

	return DomObserver;
}());
