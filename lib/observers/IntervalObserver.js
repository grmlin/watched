var IntervalObserver = (function () {

	var allElementsLive = doc.getElementsByTagName('*'),
			getAllAsArray = function () {
				return nodeListToArray(allElementsLive);
			},
			hasChanged = function (oldElements, newElements) {
				if (oldElements.length !== newElements.length) {
					return TRUE;
				}

				// check if the arrays contain
				return oldElements.some(function (element, index) {
					return element !== newElements[index];
				});
			};

	var IntervalObserver = function (selector) {
		smokesignals.convert(this);
		this._currentElements = getAllAsArray();
	};

	Object.defineProperties(IntervalObserver.prototype, {
		initialize: {
			value: function () {
				var _this = this,
						start = function () {
							setTimeout(tick, TIMEOUT_CLOCK_RESCAN_INTERVAL)
						},
						tick = function () {
							_this._checkDom();
							start();
						};

				start();
			}
		},
		_checkDom: {
			value: function () {
				var newElements = getAllAsArray();
				if (hasChanged(this._currentElements, newElements)) {
					this._currentElements = newElements;
					this.emit(CUSTOM_EVENT_ON_MUTATION);
				}

			}
		}
	});

	return IntervalObserver;
}());
