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

Creates the `DomElement` decorator we need.

```javascript
var  el = watched(document);
```

##### element
Type: `element`

The dom element you want to wrap.


##### returns
Type: `DomElement`

### DomElement

Class decorating native dom elements so it works with the internal `LiveNodeList`

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

A list of dom elements, always up to date. It's "array-like", similar to jquery objects or native node lists.

- live list, similar to the list returned by `getElementsBy(Tag|Class)Name`
- dispatches event, if the list changed!

#### LiveNodeList#length

Current length of the nodelist

#### LiveNodeList#added(callback)

Adds a callback to the node list. The callback will be called, when new elements are added to the dom

```javascript
nodeList.added(function(newElements){
	console.log(newElements);
});
```

##### callback(newElements:Array)
Type: `function`

Callback will be called with one argument: an array `newElements` containing the newly found dom elements

#### LiveNodeList#removed(callback)

Adds a callback to the node list. The called will be called, when new elements are added to the dom

```javascript
nodeList.removed(function(removedElements){
	console.log(removedElements);
});
```

##### callback(removedElements:Array)
Type: `function`

Callback will be called with one argument: an array `removedElements` containing the dom elements removed from the list (removed from the dom)

#### LiveNodeList#forEach()

see the native [`Array.forEach`](http://devdocs.io/javascript/global_objects/array/foreach) for details.

```javascript
nodeList.forEach(function(element){
	element.style.color = "green";
});
```

#### LiveNodeList#destroy()

Destroys the nodelist and removes all dom mutation listeners

```javascript
nodeList.destroy();
```

