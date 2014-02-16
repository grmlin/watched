describe('watched namespace', function () {
	it('exposes a public interface', function () {
		expect(watched).to.be.a('function');
	});

	it('the event names are set correctly ', function () {
		expect(CUSTOM_EVENT_ON_ELEMENTS_ADDED).to.equal('added');
		expect(CUSTOM_EVENT_ON_ELEMENTS_REMOVED).to.equal('removed');
		expect(CUSTOM_EVENT_ON_ELEMENTS_CHANGED).to.equal('changed');
	});

	it('creates a DomElement and LiveNodeList instances', function () {
		expect(watched(document)).to.be.a(DomElement);
		expect(watched('.dom-element-quick-test')).to.be.a(LiveNodeList);
		expect(function () {
			watched({});
		}).to.throwError();
		expect(function () {
			watched(123);
		}).to.throwError();
		expect(function () {
			watched();
		}).to.throwError();
	});
});

describe('DomElement', function () {
	var element = new DomElement(document);

	it('supports multiple selectors', function () {
		expect(element.querySelectorAll).to.be.a('function');
		expect(element.querySelector).to.be.a('function');
		expect(element.getElementsByTagName).to.be.a('function');
		expect(element.getElementsByClassName).to.be.a('function');
	});

	it('returns LiveNodeLists', function () {
		expect(element.querySelectorAll('.dom-element-test')).to.be.a(LiveNodeList);
		expect(watched('.dom-element-test')).to.be.a(LiveNodeList);
		expect(element.querySelector('.dom-element-test')).to.be.a(LiveNodeList);
		expect(element.getElementsByTagName('script')).to.be.a(LiveNodeList);
		expect(element.getElementsByClassName('.dom-element-test')).to.be.a(LiveNodeList);
	});

});

describe('LiveNodeList', function () {
	var CSS_CLASS = "livenodelist-test";
	var element = new DomElement(document);
	var list = element.querySelectorAll('.' + CSS_CLASS);

	it('has a public interface', function () {
		expect(list.pause).to.be.a('function');
		expect(list.resume).to.be.a('function');
		expect(list.on).to.be.a('function');
		expect(list.off).to.be.a('function');
		expect(list.forEach).to.be.a('function');
		expect(list.length).to.be.a('number');
	});

	it('knows the length', function () {
		var el1 = document.createElement('div'),
				el2 = document.createElement('div'),
				el3 = document.createElement('div');

		el1.className = "knows-the-length";
		el2.className = "knows-the-length";
		el3.className = "knows-the-length";

		document.body.appendChild(el1);
		document.body.appendChild(el2);
		document.body.appendChild(el3);

		var list2 = element.querySelectorAll('.knows-the-length');
		expect(list2.length).to.equal(3);
	});

	it('detects dom additions', function (done) {
		var el = document.createElement('div');
		el.className = CSS_CLASS;

		list.on('added', function (newElements) {
			try {
				expect(list.length).to.equal(1);
				expect(newElements.length).to.equal(1);
				expect(newElements[0]).to.equal(el);
				expect(list[0]).to.equal(el);
				done();
			} catch (e) {
				done(e);
			}
		});

		setTimeout(function () {
			document.body.appendChild(el);
		}, 10);
	});

	it('detects dom deletions', function (done) {
		var el = document.querySelector('.' + CSS_CLASS);

		list.on('removed', function (removedElements) {
			try {
				expect(list.length).to.equal(0);
				expect(removedElements.length).to.equal(1);
				expect(removedElements[0]).to.equal(el);
				done();
			} catch (e) {
				done(e);
			}
		});

		el.parentNode.removeChild(el);
	});

	it('detects dom changes in general', function (done) {
		var CSS_CLASS_2 = "another-" + CSS_CLASS;
		var list = element.querySelectorAll('.' + CSS_CLASS_2);
		var el2 = document.createElement('div');
		var times = 0;
		el2.className = CSS_CLASS_2;

		list.on('changed', function (currentElements) {
			try {
				//added
				if (times === 0) {
					expect(list.length).to.equal(1);
					expect(currentElements.length).to.equal(1);
					expect(currentElements[0]).to.equal(el2);
					expect(list[0]).to.equal(el2);

					times++;
					el2.parentNode.removeChild(el2);
				}
				//removed
				else if (times === 1) {
					expect(list.length).to.equal(0);
					expect(currentElements.length).to.equal(0);
					done();
				}

			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(el2);

	});

	it('detects changes in batches', function (done) {
		var CSS_CLASS_2 = "detects-changes-in-batches";
		var list = element.querySelectorAll('.' + CSS_CLASS_2);
		var times = 0;

		var el1 = document.createElement('div'),
				el2 = document.createElement('div'),
				el3 = document.createElement('div');

		el1.className = CSS_CLASS_2;
		el2.className = CSS_CLASS_2;
		el3.className = CSS_CLASS_2;



		el2.className = CSS_CLASS_2;

		list.on('added', function (newElements) {
			try {
				expect(times).to.equal(0);
				expect(list.length).to.equal(3);
				expect(newElements.length).to.equal(3);
				expect(newElements).to.contain(el1);
				expect(newElements).to.contain(el2);
				expect(newElements).to.contain(el3);
				expect(list).to.contain(el1);
				expect(list).to.contain(el2);
				expect(list).to.contain(el3);
				el1.parentNode.removeChild(el1);
				el3.parentNode.removeChild(el3);
				times++;
			} catch (e) {
				done(e);
			}

		});

		list.on('removed', function (removedElements) {
			try {
				expect(times).to.equal(1);
				expect(list.length).to.equal(1);
				expect(removedElements.length).to.equal(2);
				expect(removedElements).to.contain(el1);
				expect(removedElements).to.contain(el3);
				expect(list).to.contain(el2);
				done();
			} catch (e) {
				done(e);
			}
		});

		list.on('changed', function(currentElements) {
			try {
				if (times === 0) {
					expect(list.length).to.equal(3);
					expect(currentElements.length).to.equal(3);
					expect(currentElements).to.contain(el1);
					expect(currentElements).to.contain(el2);
					expect(currentElements).to.contain(el3);
					expect(list).to.contain(el1);
					expect(list).to.contain(el2);
					expect(list).to.contain(el3);
				} else if (times === 1) {
					expect(list.length).to.equal(1);
					expect(list).to.contain(el2);
				}
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(el1);
		document.body.appendChild(el2);
		document.body.appendChild(el3);

	});

});