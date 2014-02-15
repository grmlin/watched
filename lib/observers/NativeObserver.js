var NativeObserver = (function () {
	var opts = {
				childList: TRUE,
				subtree: TRUE
			},
			isElementMutation = function (mutation) {
				return mutation.addedNodes !== null || mutation.removedNodes !== null;
			};

	var NativeObserver = function () {
		smokesignals.convert(this);
	};

	Object.defineProperties(NativeObserver.prototype, {
		initialize: {
			value: function () {
				this._observer = new NativeMutationObserver(this._onMutation.bind(this));
				this._observer.observe(doc.body, opts);
			}
		},
		_onMutation: {
			value: debounce(function (mutations) {
				if (mutations.some(isElementMutation, this)) {
					this.emit(CUSTOM_EVENT_ON_MUTATION);
				}
			}, MUTATION_DEBOUNCE_DELAY)
		}

	});

	return NativeObserver;

}());