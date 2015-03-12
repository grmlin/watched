var constants = require('../constants');

describe('constants', function () {
	it('the event names are set correctly ', function () {
		expect(constants.CUSTOM_EVENT_ON_ELEMENTS_ADDED).to.equal('added');
		expect(constants.CUSTOM_EVENT_ON_ELEMENTS_REMOVED).to.equal('removed');
		expect(constants.CUSTOM_EVENT_ON_ELEMENTS_CHANGED).to.equal('changed');
	});

	it('gives us multiple query selectors', function(){
		var queries = constants.queries;
		expect(queries).to.be.an('object');
		expect(queries).to.have.property('QUERY_SELECTOR_ALL', 'querySelectorAll');
		expect(queries).to.have.property('QUERY_SELECTOR', 'querySelector');
		expect(queries).to.have.property('GET_ELEMENTS_BY_TAG_NAME', 'getElementsByTagName');
		expect(queries).to.have.property('GET_ELEMENTS_BY_CLASS_NAME', 'getElementsByClassName');

		expect(constants.AVAILABLE_QUERIES).to.be.an('array');
		expect(constants.AVAILABLE_QUERIES).to.eql([queries.QUERY_SELECTOR_ALL, queries.QUERY_SELECTOR, queries.GET_ELEMENTS_BY_TAG_NAME, queries.GET_ELEMENTS_BY_CLASS_NAME]);
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