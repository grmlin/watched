var constants = require('../constants');

describe('public constants', function () {
	it('the event names are set correctly ', function () {
		expect(constants.CUSTOM_EVENT_ON_ELEMENTS_ADDED).to.equal('added');
		expect(constants.CUSTOM_EVENT_ON_ELEMENTS_REMOVED).to.equal('removed');
		expect(constants.CUSTOM_EVENT_ON_ELEMENTS_CHANGED).to.equal('changed');
	});

	//it('creates a DomElement and LiveNodeList instances', function () {
	//	expect(watched(document)).to.be.a(DomElement);
	//	expect(watched('.dom-element-quick-test')).to.be.a(LiveNodeList);
	//	expect(function () {
	//		watched({});
	//	}).to.throwError();
	//	expect(function () {
	//		watched(123);
	//	}).to.throwError();
	//	expect(function () {
	//		watched();
	//	}).to.throwError();
	//});
});