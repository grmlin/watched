var IntervalObserver = function (selector) {
	smokesignals.convert(this);
};

IntervalObserver.prototype.initialize = function () {
	var _this = this,
			start = function () {
				setTimeout(tick, TIMEOUT_CLOCK_RESCAN_INTERVAL)
			},
			tick = function () {
				_this.emit(CUSTOM_EVENT_ON_MUTATION);
				start();
			};

	start();
};

