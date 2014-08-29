(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['b'], function (b) {
			return (root.returnExportsGlobal = factory(b));
		});
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory(require('b'));
	} else {
		// Browser globals
		root.returnExportsGlobal = factory(root.b);
	}
}(this, function (b) {
	//use b in some fashion.

	// Just return a value to define the module export.
	// This example returns an object, but the module
	// can return a function as the exported value.
	"use strict";
	<%= contents %>
	return watched;
}));