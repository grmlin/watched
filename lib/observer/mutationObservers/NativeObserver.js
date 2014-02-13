var NativeObserver = (function () {
	var opts = {
				childList: true,
				subtree: true
			},
			isElementMutation = function (mutation) {
				return mutation.addedNodes !== null || mutation.removedNodes !== null;
			};

	var NativeObserver = function (selector) {
		smokesignals.convert(this);

		this._selector = selector;
	};

	NativeObserver.prototype.initialize = function () {
		this._observer = new NativeMutationObserver(this._onMutation.bind(this));
		this._observer.observe(document.body, opts);
	};

	NativeObserver.prototype._onMutation = debounce(function (mutations, observer) {
		if (mutations.some(isElementMutation, this)) {
			this.emit(CUSTOM_EVENT_ON_MUTATION);
		}
	}, MUTATION_DEBOUNCE_DELAY);

	return NativeObserver;

}());