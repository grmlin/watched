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
		this._observer = new NativeMutationObserver(this._onMutation.bind(this));
		this._observer.observe(doc, opts);
	};

	Object.defineProperties(NativeObserver.prototype, {
		_onMutation: {
			value: debounce(function (mutations) {
				console.log("---------- MUTATION OBSERVER MUTATED ----------");

				if (mutations.some(isElementMutation, this)) {
					this.emit(CUSTOM_EVENT_ON_MUTATION);
				}
			}, MUTATION_DEBOUNCE_DELAY)
		}

	});

	return NativeObserver;

}());