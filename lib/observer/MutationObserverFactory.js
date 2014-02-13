var MutationObserverFactory = {
	createObserver: function(){
		var Observer;
		console.log("Created Observer: ");

		if (hasMutationObserver) {
			Observer = NativeObserver;
			console.log("native");
		} else if (hasPropertyChangeEvent) {
			Observer = PropertyChangeObserver;
			console.log("IE");
		} else {
			Observer = IntervalObserver;
			console.log("Interval");
		}
		return new Observer();
	}
};