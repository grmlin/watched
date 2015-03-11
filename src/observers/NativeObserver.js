/**
 * Native dom observer using {@link external:MutationObserver}
 *
 * @module watched/observers/NativeObserver
 */

var smokesignals      = require('smokesignals'),
		helper = require('../util/helper'),
		constants = require('../util/constants'),
		opts              = {
			childList: true,
			subtree: true
		},
		isElementMutation = function (mutation) {
			return mutation.addedNodes !== null || mutation.removedNodes !== null;
		};

var NativeObserver = {

	init: function(){
		this._observer = new helper.NativeMutationObserver(this._onMutation.bind(this));
		this._observer.observe(document, opts);
	},

	_onMutation: helper.debounce(function (mutations) {
			if (mutations.some(isElementMutation, this)) {
				this.emit(constants.CUSTOM_EVENT_ON_MUTATION);
			}
		}, constants.MUTATION_DEBOUNCE_DELAY)
};

smokesignals.convert(NativeObserver);

module.exports = NativeObserver;