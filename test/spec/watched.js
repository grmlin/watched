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

	it('returns LiveNodeLists', function(){
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
	});

});

describe('LiveNodeList', function(){
	var CSS_CLASS = "livenodelist-test";
	var element = new DomElement(document);
	var list = element.querySelectorAll('.' + CSS_CLASS);

	it('has a public interface', function(){
		expect(list.pause).to.be.a('function');
		expect(list.resume).to.be.a('function');
		expect(list.added).to.be.a('function');
		expect(list.removed).to.be.a('function');
		expect(list.changed).to.be.a('function');
		expect(list.forEach).to.be.a('function');
		expect(list.length).to.be.a('number');
	});

	it('knows the length', function(){
		expect(list.length).to.equal(0);
	});

	it('detects dom additions', function(done){
		var el = document.createElement('div');
		el.className = CSS_CLASS;

		list.added(function(newElements){
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

		setTimeout(function(){
			document.body.appendChild(el);
		}, 10);
	});

	it('detects dom deletions', function(done){
		var el = document.querySelector('.' + CSS_CLASS);

		list.removed(function(removedElements){
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


	it('detects dom changes in general', function(done){
		var CSS_CLASS_2 = "another-" + CSS_CLASS;
		var list = element.querySelectorAll('.' + CSS_CLASS_2);
		var el2 = document.createElement('div');
		var times = 0;
		el2.className = CSS_CLASS_2;

		list.changed(function(currentElements){
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
