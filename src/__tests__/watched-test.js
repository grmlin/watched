var watched = require('../watched');

describe('watched: public method', function () {

	it('exposes a factory function', function () {
		expect(watched).to.be.a('function');
		expect(function () {
			var w = new watched(document);
		}).to.throwError();
	});

	it('the factory creates DomElement and LiveNodeList instances', function () {
		expect(watched('.dom-element-quick-test')).to.have.property('__name__', 'LiveNodeList');
		expect(watched(document)).to.have.property('__name__', 'DomElement');
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

describe('watched: added event', function () {
	var classname,
			wrapper,
			inside,
			outside;

	beforeEach(function () {
		classname = "supports-" + this.currentTest.title;
		wrapper = document.createElement('div');
		inside = document.createElement('div');
		outside = document.createElement('div');

		inside.className = classname;
		outside.className = classname;

		document.body.appendChild(wrapper);
	});

	it('querySelectorAll', function (done) {

		var list = watched(wrapper).querySelectorAll("." + classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(1);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.not.contain(outside);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
	});

	it('querySelector', function (done) {

		var list = watched(wrapper).querySelector("." + classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(1);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.not.contain(outside);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
	});

	it('getElementsByTagName', function (done) {
		var inside        = document.createElement('span'),
				inside2       = document.createElement('span'),
				insideInvalid = document.createElement('div'),
				outside       = document.createElement('span');

		var list = watched(wrapper).getElementsByTagName("span");
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(2);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.contain(inside2);
				expect(addedElements).to.not.contain(outside);
				expect(addedElements).to.not.contain(insideInvalid);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
		wrapper.appendChild(insideInvalid);
	});

	it('getElementsByClassName', function (done) {
		var inside2       = document.createElement('div'),
				insideInvalid = document.createElement('div');

		inside2.className = classname;
		insideInvalid.className = classname + "-NOT";

		var list = watched(wrapper).getElementsByClassName(classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(2);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.contain(inside2);
				expect(addedElements).to.not.contain(outside);
				expect(addedElements).to.not.contain(insideInvalid);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
		wrapper.appendChild(insideInvalid);
	});

});

describe('watched: added event', function () {
	var classname,
			wrapper,
			inside,
			outside;

	beforeEach(function () {
		classname = "supports-" + this.currentTest.title;
		wrapper = document.createElement('div');
		inside = document.createElement('div');
		outside = document.createElement('div');

		inside.className = classname;
		outside.className = classname;

		document.body.appendChild(wrapper);
	});

	it('querySelectorAll', function (done) {

		var list = watched(wrapper).querySelectorAll("." + classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(1);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.not.contain(outside);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
	});

	it('querySelector', function (done) {

		var list = watched(wrapper).querySelector("." + classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(1);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.not.contain(outside);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
	});

	it('getElementsByTagName', function (done) {
		var inside        = document.createElement('span'),
				inside2       = document.createElement('span'),
				insideInvalid = document.createElement('div'),
				outside       = document.createElement('span');

		var list = watched(wrapper).getElementsByTagName("span");
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(2);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.contain(inside2);
				expect(addedElements).to.not.contain(outside);
				expect(addedElements).to.not.contain(insideInvalid);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
		wrapper.appendChild(insideInvalid);
	});

	it('getElementsByClassName', function (done) {
		var inside2       = document.createElement('div'),
				insideInvalid = document.createElement('div');

		inside2.className = classname;
		insideInvalid.className = classname + "-NOT";

		var list = watched(wrapper).getElementsByClassName(classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(2);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.contain(inside2);
				expect(addedElements).to.not.contain(outside);
				expect(addedElements).to.not.contain(insideInvalid);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
		wrapper.appendChild(insideInvalid);
	});

});


describe('watched: changed event', function () {
	var classname,
			wrapper,
			inside,
			outside;

	beforeEach(function () {
		classname = "supports-" + this.currentTest.title;
		wrapper = document.createElement('div');
		inside = document.createElement('div');
		outside = document.createElement('div');

		inside.className = classname;
		outside.className = classname;

		document.body.appendChild(wrapper);
	});


	it('querySelectorAll', function (done) {
		var list = watched(wrapper).querySelectorAll("." + classname);
		list.on('changed', function (currentElements) {
			try {
				list.off('changed');
				expect(list.length).to.equal(1);
				expect(currentElements).to.contain(inside);
				expect(currentElements).to.not.contain(outside);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
	});

	it('querySelector', function (done) {
		var list = watched(wrapper).querySelector("." + classname);
		list.on('changed', function (currentElements) {
			try {
				list.off('changed');
				expect(list.length).to.equal(1);
				expect(currentElements).to.contain(inside);
				expect(currentElements).to.not.contain(outside);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
	});

	it('getElementsByTagName', function (done) {
		var inside        = document.createElement('span'),
				inside2       = document.createElement('span'),
				insideInvalid = document.createElement('div'),
				outside       = document.createElement('span');

		var list = watched(wrapper).getElementsByTagName("span");
		list.on('changed', function (currentElements) {
			try {
				list.off('changed');
				expect(list.length).to.equal(2);
				expect(currentElements).to.contain(inside);
				expect(currentElements).to.contain(inside2);
				expect(currentElements).to.not.contain(outside);
				expect(currentElements).to.not.contain(insideInvalid);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
		wrapper.appendChild(insideInvalid);
	});

	it('getElementsByClassName', function (done) {
		var inside2       = document.createElement('div'),
				insideInvalid = document.createElement('div');

		inside2.className = classname;
		insideInvalid.className = classname + "-NOT";

		var list = watched(wrapper).getElementsByClassName(classname);
		list.on('changed', function (currentElements) {
			try {
				list.off('changed');
				expect(list.length).to.equal(2);
				expect(currentElements).to.contain(inside);
				expect(currentElements).to.contain(inside2);
				expect(currentElements).to.not.contain(outside);
				expect(currentElements).to.not.contain(insideInvalid);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
		wrapper.appendChild(insideInvalid);
	});

});


describe('watched: removed event', function () {
	var classname,
			wrapper,
			inside,
			outside;

	beforeEach(function () {
		classname = "supports-" + this.currentTest.title;
		wrapper = document.createElement('div');
		inside = document.createElement('div');
		outside = document.createElement('div');

		inside.className = classname;
		outside.className = classname;

		document.body.appendChild(wrapper);
	});


	it('querySelectorAll', function (done) {
		var list = watched(wrapper).querySelectorAll("." + classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				expect(list.length).to.equal(1);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.not.contain(outside);
				wrapper.removeChild(inside);
			} catch (e) {
				done(e);
			}
		}).on('removed', function (removedElements) {
			try {
				expect(list.length).to.equal(0);
				expect(removedElements).to.contain(inside);
				expect(list).to.not.contain(inside);
				done();
			} catch (e) {
				done(e);
			}
		});

		document.body.appendChild(outside);
		wrapper.appendChild(inside);
	});
});


describe('watched: events can be dismissed', function () {
	var classname,
			wrapper,
			inside,
			inside2;

	beforeEach(function () {
		classname = "supports-" + this.currentTest.title;
		wrapper = document.createElement('div');
		inside = document.createElement('div');
		inside2 = document.createElement('div');

		inside.className = classname;
		inside2.className = classname;

		document.body.appendChild(wrapper);
	});


	it('querySelectorAll', function (done) {
		var eventCount = 0;
		var list = watched(wrapper).querySelectorAll("." + classname);
		list.on('added', function (addedElements) {
			try {
				list.off('added');
				eventCount++;
				expect(list.length).to.be(1);
				wrapper.appendChild(inside2);

				//wrapper.removeChild(inside);
			} catch (e) {
				done(e);
			}
		}).on('removed', function (removedElements) {
			try {
				expect(list.length).to.equal(0);
				expect(removedElements).to.contain(inside);
				expect(list).to.not.contain(inside);
				done();
			} catch (e) {
				done(e);
			}
		});

		setTimeout(function () {
			done();
		}, 1500);

		wrapper.appendChild(inside);
	});
});


describe('watched: recognizes parent element removal', function () {
	var classname,
			wrapper,
			inside,
			inside2;

	beforeEach(function () {
		classname = "parent-removed-" + this.currentTest.title;
		wrapper = document.createElement('div');
		inside = document.createElement('div');
		inside2 = document.createElement('div');

		inside.className = classname;
		inside2.className = classname;

		document.body.appendChild(wrapper);
	});


	it('querySelectorAll', function (done) {
		var list = watched(wrapper).querySelectorAll("." + classname);
		var timesAdded = 0;

		list.on('added', function (addedElements) {
			try {
				timesAdded++;
				expect(list.length).to.equal(2);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.contain(inside2);

				if (timesAdded === 1) {
					wrapper.parentElement.removeChild(wrapper);
				} else if (timesAdded === 2) {
					done();
				}
			} catch (e) {
				done(e);
			}
		}).on('removed', function (removedElements) {
			try {
				expect(list.length).to.equal(0);
				expect(removedElements).to.contain(inside);
				expect(list).to.not.contain(inside);
				document.body.appendChild(wrapper);
			} catch (e) {
				done(e);
			}
		});

		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
	});
});


describe('watched: elements can be removed and added again', function () {
	var classname,
			wrapper,
			inside,
			inside2;

	beforeEach(function () {
		classname = "parent-readded-" + this.currentTest.title;
		wrapper = document.createElement('div');
		inside = document.createElement('div');
		inside2 = document.createElement('div');

		inside.className = classname;
		inside2.className = classname;

		document.body.appendChild(wrapper);
	});


	it('querySelectorAll', function (done) {
		var list = watched(wrapper).querySelectorAll("." + classname);
		var timesAdded = 0;

		list.on('added', function (addedElements) {
			try {
				timesAdded++;
				expect(list.length).to.equal(2);
				expect(addedElements).to.contain(inside);
				expect(addedElements).to.contain(inside2);

				if (timesAdded === 1) {
					wrapper.removeChild(inside);
					wrapper.removeChild(inside2);
				} else if (timesAdded === 2) {
					done();
				}
			} catch (e) {
				done(e);
			}
		}).on('removed', function (removedElements) {
			try {
				expect(list.length).to.equal(0);
				expect(removedElements).to.contain(inside);
				expect(list).to.not.contain(inside);
				wrapper.appendChild(inside);
				wrapper.appendChild(inside2);
			} catch (e) {
				done(e);
			}
		});

		wrapper.appendChild(inside);
		wrapper.appendChild(inside2);
	});
});