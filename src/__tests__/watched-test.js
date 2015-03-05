var watched = require('../watched');

describe('watched namespace', function () {

	it('exposes a public interface', function () {
		expect(watched).to.be.a('function');
		expect(function () {
			var w = new watched(document);
		}).to.throwError();
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