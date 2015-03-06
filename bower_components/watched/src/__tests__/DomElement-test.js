var DomElement = require('../DomElement');

describe('DomElement', function () {

	it('is a factory function, not a constructor', function () {
		expect(DomElement).to.be.a('function');
		expect(function () {
			var domElement = new DomElement(document);
		}).to.throwError();
	});

	it('wraps dom elements', function () {
		//domEl.init(document);

		expect(function () {
			DomElement('');
		}).to.throwError();

		expect(function () {
			DomElement();
		}).to.throwError();

		expect(function () {
			DomElement({});
		}).to.throwError();

		expect(function () {
			DomElement('foobar');
		}).to.throwError();

		expect(DomElement(document)).to.be.an('object');
		expect(DomElement(document).el).to.equal(document);
	});

	it('creates instances', function () {
		expect(DomElement(document)).to.not.equal(DomElement(document));
	});

	it('provides query selectors', function () {
		var el = DomElement(document);

		expect(el.querySelectorAll).to.be.a('function');
		expect(el.querySelector).to.be.a('function');
		expect(el.getElementsByTagName).to.be.a('function');
		expect(el.getElementsByClassName).to.be.a('function');

	});

	// ------------------

	var element = DomElement(document);

	it('returns LiveNodeLists', function () {
		expect(element.querySelectorAll('.dom-element-test')).to.have.property('__name__', 'LiveNodeList');
		expect(element.querySelector('.dom-element-test')).to.have.property('__name__', 'LiveNodeList');
		expect(element.getElementsByTagName('script')).to.have.property('__name__', 'LiveNodeList');
		expect(element.getElementsByClassName('.dom-element-test')).to.have.property('__name__', 'LiveNodeList');
	});








});
