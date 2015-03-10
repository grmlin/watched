var DomElement = require('../DomElement');

describe('DomElement', function () {
	var domElement;

	beforeEach(function () {
		domElement = DomElement(document);
	});

	it('is factory function', function () {
		expect(DomElement).to.be.a('function');
		expect(function () {
			var domElement = new DomElement(document);
		}).to.throwError();
		expect(function () {
			DomElement('');
		}).to.throwError();
	});

	it('wraps dom elements', function () {
		expect(domElement).to.be.an('object');
		expect(domElement.el).to.equal(document);
	});

	it('creates instances', function () {
		var element2 = DomElement(document);
		expect(element2).to.not.equal(domElement);
	});

	it('provides query selectors', function () {
		expect(domElement.querySelectorAll).to.be.a('function');
		expect(domElement.querySelector).to.be.a('function');
		expect(domElement.getElementsByTagName).to.be.a('function');
		expect(domElement.getElementsByClassName).to.be.a('function');
	});


	it('returns LiveNodeLists', function () {
		expect(domElement.querySelectorAll('.dom-element-test')).to.have.property('__name__', 'LiveNodeList');
		expect(domElement.querySelector('.dom-element-test')).to.have.property('__name__', 'LiveNodeList');
		expect(domElement.getElementsByTagName('script')).to.have.property('__name__', 'LiveNodeList');
		expect(domElement.getElementsByClassName('.dom-element-test')).to.have.property('__name__', 'LiveNodeList');
	});








});
