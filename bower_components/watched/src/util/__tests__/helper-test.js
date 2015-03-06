var helper = require('../helper');

describe('helpers', function () {
	it('provides helper properties ', function () {
		expect(helper.hasMutationObserver).to.be.a('boolean');
	});

	it('checks dom elements', function () {
		expect(helper.isInvalidDomElement).to.be.a('function');
		expect(helper.isInvalidDomElement(document)).to.not.be.ok();
		expect(helper.isInvalidDomElement()).to.be.ok();
		expect(helper.isInvalidDomElement(null)).to.be.ok();
		expect(helper.isInvalidDomElement(true)).to.be.ok();
		expect(helper.isInvalidDomElement(false)).to.be.ok();
		expect(helper.isInvalidDomElement('foobar')).to.be.ok();
		expect(helper.isInvalidDomElement('')).to.be.ok();
	});

	it('converts node lists to arrays', function () {
		var nodeList      = document.querySelectorAll('.node-list-test'),
				nodeListArray = helper.nodeListToArray(nodeList);

		expect(nodeListArray).to.be.an('array');
		expect(nodeListArray).to.have.length(8);
	});

	it('checks for elements in an array', function () {
		var a = [1, 2, '3', null];
		expect(helper.arrayContains(a, 1)).to.be.ok();
		expect(helper.arrayContains(a, 2)).to.be.ok();
		expect(helper.arrayContains(a, 3)).to.not.be.ok();
		expect(helper.arrayContains(a, '3')).to.be.ok();
		expect(helper.arrayContains(a, null)).to.be.ok();
		expect(helper.arrayContains(a, 'foo')).to.not.be.ok();
		expect(helper.arrayContains(a)).to.not.be.ok();
	});

	it('clones arrays', function () {
		var a     = [1, 2, 3],
				clone = helper.arrayClone(a);

		expect(clone).to.be.an('array');
		expect(clone).to.not.equal(a);
		expect(clone).to.eql(a);
	});

	it('can debounce functions', function (done) {
		var i         = 0,
				debounced = helper.debounce(function () {
					i++;

					try {
						expect(i).to.equal(1);
						done();
					} catch (e) {
						done(e);
					}
				}, 100);

		debounced();
		setTimeout(function () {
			debounced();
		}, 10);


	});

});