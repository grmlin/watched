var watched = require('../watched');

describe('watched namespace', function () {
	it('exposes a public interface', function () {
		expect(watched).to.be.a('function');
	});

	//it('the event names are set correctly ', function () {
	//	expect(CUSTOM_EVENT_ON_ELEMENTS_ADDED).to.equal('added');
	//	expect(CUSTOM_EVENT_ON_ELEMENTS_REMOVED).to.equal('removed');
	//	expect(CUSTOM_EVENT_ON_ELEMENTS_CHANGED).to.equal('changed');
	//});

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