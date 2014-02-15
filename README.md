changed.js
==========

Dom watchdog in plain javascript

```javascript
var nodeList = watched(document).querySelectorAll('.foo');

nodeList.added(function(addedElements){
	console.log('Found ' + addedElements.length + ' new element(s) in this list. Total length: ' + nodeList.length);
});
nodeList.removed(function(removedElements){
	console.log(removedElements.length + ' element(s) were removed from this list. Total length: ' + nodeList.length);
});
```
## API

### watched

#### watched(element) : DomElement

Creates the `DomElement` wrapper we need.

```javascript
var  el = watched(document);
```

##### element
Type: `element`

The dom element you want to wrap.


##### returns
Type: `DomElement`

### DomElement

Class wrapping a native dom element so it works with the internal `LiveNodeList`

#### DomElement#querySelectorAll(selector) : LiveNodeList

Get a live node list of dom elements similar to the native [`NodeList`](http://devdocs.io/dom/nodelist).

```javascript
var nodeList = watched(document).querySelectorAll('.foo');
```

##### selector
Type: `string`

The selector. See [`querySelectorAll`](http://devdocs.io/dom/document.queryselectorall) for details.

##### returns
Type: `LiveNodeList`

### LiveNodeList

A list of dom elements, always up to date

- live list, you might already know it using `getElementsBy(Tag|Class)Name`
-	dispatches event, if the list changed!

#### LiveNodeList#added(callback)

Adds a callback to the node list. The called will be called, when new elements are added to the dom

```javascript
nodeList.added(function(newElements){
	console.log(newElements);
});
```

##### callback(newElements:Array)
Type: `function`

Callback will be called with two arguments: an array `newElements` containing the newly found elements, and a second array `allElements` containing all elements currently found

#### LiveNodeList#removed(callback)
#### LiveNodeList#destroy()