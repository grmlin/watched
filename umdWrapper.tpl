
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], function () {
			// Also create a global in case some scripts
			// that are loaded still are looking for
			// a global even when an AMD loader is in use.
			return (root.watched = factory());
		});
	} else {
		// Browser globals
		root.watched = factory();
	}
}(this, function () {
	"use strict";
	<%= contents %>
	return watched;
}));