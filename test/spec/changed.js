describe('changed.js namespace', function () {
	it('the namespace should exist', function () {
		expect(changed).to.be.an('object');
	});

	it('creates observers', function () {
		expect(changed.watch).to.be.a('function');

		/*var observer = changed.watch('.foo');
		 expect(observer).to.be.an('object');
		 expect(observer).to.be.a(DomObserver);*/
	});
});

describe('DomObserver', function () {
	var elId = 0;
	var createEl = function (className) {
		var el = document.createElement('div');
		elId++;
		el.id = className + '__' + elId;
		el.className = className;
		document.body.appendChild(el);
	};

	it('uses a selector to provide a nodelist', function (done) {
		this.timeout(5000);

		var CLASSNAME = 'DomObserver-1';

		var observer = new DomObserver('.' + CLASSNAME);
		observer.on(changed.event.ELEMENTS_ADDED, function (addedElements, currentElements) {
			try {
				expect(addedElements).to.have.length(1);
				done();
			} catch (e) {
				done(e);
			}
		});

		expect(observer.elements).to.be.an('array');
		expect(observer.elements).to.have.length(0);

		createEl(CLASSNAME);

		/*expect(observer.getElements).to.be.a('function');
		 expect(observer.getElements()).to.be.an('array');
		 expect(observer.getElements()).to.have.length(1);*/

	});
});