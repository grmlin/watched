watched.js
==========

Live, event driven dom element collections 

- [Website](http://grmlin.github.io/watched/)
- [Demo](http://grmlin.github.io/watched/demo.html)


```javascript
// give me nodelists

// quick
var foos  = watched('.foo'); 
// or more specific
var foos2 = watched(document).querySelectorAll('.foo'); // same as watched('.foo')
var bars  = watched(document).querySelector('.bar');
var bazs  = watched(document).getElementsByClassName('.baz');
var links = watched(document).getElementsByTagName('a');

// need the length
var linkcount = links.length;

// access elements directly 
var aLink = links[0];

// or iterate
foos.forEach(function(element){
  console.log(element);
});

// finally, stay up to date, when elements are added
nodeList.on('added', function(addedElements){
	console.log(addedElements);
});

// removed
nodeList.on('removed', function(removedElements){
	console.log(removedElements);
});

// or changed in general
nodeList.on('changed', function(currentElements){
	console.log(currentElements);
});
```

## Getting started
Include the latest build you can find inside the `dist` folder in your html.

## How?

Behind the scenes, **watched.js** uses the all new [`MutationObserver`](http://devdocs.io/dom/mutationobserver) to detect changes in the dom. [Browser support](http://caniuse.com/#feat=mutationobserver) is quite good these days.

An interval based fallback is included, so older browsers will profit, too. Anything >= IE9 should be fine.

In either case only a single mutation observer will be created for the scripts lifespan. All `LiveNodeList` instances will listens to this one observer. 


## Important notes

- **The dom mutation listener is debounced!** That's why massive changes to the dom will happen in batches, not individually, and take some time. (20ms at the moment)

- **Always use the ` added`, `removed` and `changed` events!** The node lists are live and bound to changes in the dom, but never called synchronously after the dom changed (see debouncing above). 

- **The fallback is slower than native!** It uses an intervall to scan for changes. It's not a good idea to do this too often, so the current timeout is set to 500ms. 

- **The magic might become expensive!** You better not use hundreds of live nodelists, they will all be updated and the queries re-evaluated in the background, when the dom changes!


## API

### watched
The globally available namespace. Can be used to either get a `LiveNodeList` directly or a decorated dom element to create lists with different queries by yourself.

#### watched(selector) : [LiveNodeList](#livenodelist)

Shorthand to create a [`LiveNodeList`](#livenodelist) using `document` as the parent element and [`DomElement#querySelectorAll`](#domelementqueryselectorallselector--livenodelist).

```javascript
var foos = watched('.foo');
```

the same nodelist can be created with

```javascript
var foos = watched(document).querySelectorAll('.foo');
```

##### selector
Type: `string`

The selector you would also use in [`DomElement#querySelectorAll`](#domelementqueryselectorallselector--livenodelist)


##### returns
Type: [`LiveNodeList`](#livenodelist)

#### watched(element) : [DomElement](#domelement)

Creates the `DomElement` decorator we need.

```javascript
var  el = watched(document);
```

##### element
Type: `HTMLElement`

The dom element you want to wrap.


##### returns
Type: [`DomElement`](#domelement)

### DomElement

Class decorating native dom elements so it uses the internal `LiveNodeList`

#### DomElement#querySelectorAll(selector) : [LiveNodeList](#livenodelist)

See [`querySelectorAll`](http://devdocs.io/dom/document.queryselectorall) for details.

```javascript
var nodeList = watched(document).querySelectorAll('.foo');
```

#### DomElement#querySelector(selector) : [LiveNodeList](#livenodelist)

See [`querySelector`](http://devdocs.io/dom/document.queryselector) for details. The returned object will be always a `LiveNodeList`, not a single element as in the native `querySelector`.

```javascript
var nodeList = watched(document).querySelector('.foo');
```


#### DomElement#getElementsByTagName(selector) : [LiveNodeList](#livenodelist)

See [`getElementsByTagName`](http://devdocs.io/dom/element.getelementsbytagname) for details. Should be faster than the query selectors, as **watched.js** uses the native live nodelist internally to get the elements you want.

```javascript
var nodeList = watched(document).getElementsByTagName('a');
```


#### DomElement#getElementsByClassName(selector) : [LiveNodeList](#livenodelist)

See [`getElementsByClassName`](http://devdocs.io/dom/document.getelementsbyclassname) for details. Should be faster than the query selectors, as **watched.js** uses the native live nodelist internally to get the elements you want.

```javascript
var nodeList = watched(document).getElementsByClassName('.foo');
```


### LiveNodeList

A list of dom elements, always up to date. It's "array-like", similar to jquery objects or native node lists.

- live list, similar to the list returned by `getElementsBy(Tag|Class)Name`
- dispatches event, if the list changed!

#### LiveNodeList#length

Current length of the nodelist

#### LiveNodeList#on(eventName, callback)

Adds an event listener

##### eventName
Type: `string`

see [events](#livenodelist.events) for available event types

#### callback
Type: `function`

#### LiveNodeList#off(eventName, callback)

Removes an event listener

##### eventName
Type: `string`

see [events](#livenodelist.events) for available event types

#### callback
Type: `function`


#### LiveNodeList#forEach(callback)

see the native [`Array.forEach`](http://devdocs.io/javascript/global_objects/array/foreach) for details.

```javascript
nodeList.forEach(function(element){
	element.style.color = "green";
});
```

#### LiveNodeList#pause()

Freezes the nodelist in it's current form and removes the dom mutation listener

```javascript
nodeList.pause();
```

#### LiveNodeList#resume()

Resumes all dom mutation listeners and will update the nodelist, if it changes

```javascript
nodeList.resume();
```

#### LiveNodeList.Events

#### "changed"

Event called when new elements are added to or removed from the dom

```javascript
nodeList.on('changed', function(currentElements){
	console.log(currentElements);
});
```

The event listeners callback will be called with one argument: an array containing all elements currently in the list

#### "added"
Event called when new elements are added to the dom

```javascript
nodeList.on('added', function(newElements){
	console.log(newElements);
});
```

The event listeners callback will be called with one argument: an array containing the newly found dom elements

#### "removed"

Event called when elements are removed from the dom

```javascript
nodeList.on('removed', function(removedElements){
	console.log(removedElements);
});
```

The event listeners callback will be called with one argument: an array `removedElements` containing the dom elements removed from the list (removed from the dom)


## Thanks

- [DECAF](http://decaf.de/)
- [smokesignals.js](https://bitbucket.org/bentomas/smokesignals.js/) - used as event emitter
