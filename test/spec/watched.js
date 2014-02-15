describe('watched namespace', function () {
	it('the namespace should exist', function () {
		expect(watched).to.be.a('function');
	});

	it('creates a DomElement instance', function() {
		expect(watched(document)).to.be.a(DomElement);
		expect(function(){
			watched({});
		}).to.throwError();
	});
});

describe('DomElement', function(){
	var element = new DomElement(document);

	it('gives me LiveNodeLists', function(){
		//var liveNodeList = element.querySelectorAll('.dom-element-test');
		expect(element.querySelectorAll).to.be.a('function');
		expect(element.querySelector).to.be.a('function');
		expect(element.getElementsByTagName).to.be.a('function');
		expect(element.getElementsByClassName).to.be.a('function');

		var listQuerySelectorAll = element.querySelectorAll('.dom-element-test'),
				listWatchQuery = watched('.dom-element-test'),
				listQuerySelector = element.querySelector('.dom-element-test'),
				listElementsByTagName = element.getElementsByTagName('script'),
				listElementsByClassName = element.getElementsByClassName('.dom-element-test');

		expect(listQuerySelectorAll).to.be.a(LiveNodeList);
		expect(listWatchQuery).to.be.a(LiveNodeList);
		expect(listQuerySelector).to.be.a(LiveNodeList);
		expect(listElementsByTagName).to.be.a(LiveNodeList);
		expect(listElementsByClassName).to.be.a(LiveNodeList);

		expect(listQuerySelectorAll.pause).to.be.a('function');
		expect(listQuerySelectorAll.resume).to.be.a('function');
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
