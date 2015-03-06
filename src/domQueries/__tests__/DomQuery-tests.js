var DomQuery = require('../DomQuery');

describe('DomQuery', function () {

	it('it wraps query strategies', function () {
		expect(DomQuery).to.be.an('object');
		expect(DomQuery.init).to.a('function');
		expect(DomQuery.old).to.a('function');
		expect(DomQuery.current).to.a('function');
	});


});