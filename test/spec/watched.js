describe('watched namespace', function () {
	it('the namespace should exist', function () {
		expect(watched).to.be.a('function');
	});

	it('creates a DomElement instance', function() {
		expect(watched(document)).to.be.a(DomElement);
	});
});

describe('DomElement', function(){
	var element = new DomElement(document);

	it('supports dom queries', function(){
		var liveNodeList = element.querySelectorAll('.dom-element-test');
		expect(element.querySelectorAll).to.be.a('function');
		expect(liveNodeList).to.be.a(LiveNodeList);
		expect(liveNodeList._query).to.be.a(DomQuery);
	});

	it('is created by calling watched', function(){

	});
});

/*
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

		var elements = watched(document).querySelectorAll('.foo')

		observer.added(function(addedElements, allElements){
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

		*/
/*expect(observer.getElements).to.be.a('function');
		 expect(observer.getElements()).to.be.an('array');
		 expect(observer.getElements()).to.have.length(1);*//*


	});
});*/
