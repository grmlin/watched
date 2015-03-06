var QueryStrategyFactory = require('../QueryStrategyFactory');

describe('QueryStrategyFactory', function () {

	it('can create query strategies', function () {
		expect(QueryStrategyFactory.create).to.be.a('function');
	});

	it('uses querySelectorAll', function(){
		var query = QueryStrategyFactory.create('querySelectorAll', document, '.query-strategy-test');

		expect(query).to.be.a('function');
		expect(query()).to.be.an('array');
		expect(query()).to.have.length(4);

	});


	it('uses querySelector', function(){
		var query = QueryStrategyFactory.create('querySelector', document, '.query-strategy-test');

		expect(query).to.be.a('function');
		expect(query()).to.be.an('array');
		expect(query()).to.have.length(1);

	});

	it('uses getElementsByTagName', function(){
		var query = QueryStrategyFactory.create('getElementsByTagName', document, 'body');

		expect(query).to.be.a('function');
		expect(query()).to.be.an('array');
		expect(query()).to.have.length(1);

	});

	it('uses getElementsByClassName', function(){
		var query = QueryStrategyFactory.create('getElementsByClassName', document, 'query-strategy-test');

		expect(query).to.be.a('function');
		expect(query()).to.be.an('array');
		expect(query()).to.have.length(4);

	});


});