changed.js
==========

Dom watchdog in plain javascript


## Usage

	var observer = changed.watch('.foo .bar');

	observer.on('added', function(el) {
		// `el` added to the dom
	});

	observer.on('removed', function(el) {
		// `el` removed from the dom
	});

	observer.off('added');

	observer.destroy();