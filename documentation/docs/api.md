## watched
`LiveNodeList watched(String selector)`  
`DomElement   watched(HTMLElement element)`

Creates a `LiveNodeList` directly, or a decorated `HTMLElement` as `DomElement` to get lists with
different queries by yourself.

Use a selector to get a `LiveNodeList` or an `HTMLElement` for complete control


```js
var watched = require('watched');

var foos = watched('.foo'); // LiveNodeList
var foos = watched(document); // DomElement
```

<br><br>
## DomElement

Wrapper for a `HTMLElement`, that offers different queries. All queries return the same type of `LiveNodeList` that's 
constantly updated, aka live.

### querySelectorAll

`LiveNodeList querySelectorAll(String selector)` 

Used like the native [`querySelectorAll`](http://devdocs.io/dom/document.queryselectorall).

```js
var foos = watched(document).querySelectorAll('.foo'); // LiveNodeList
```

### querySelector

`LiveNodeList querySelector(String selector)` 

See [`querySelector`](http://devdocs.io/dom/document.queryselector) for details. The returned object will always be 
a `LiveNodeList`, not a single element as in the native `querySelector`.

```js
var foos = watched(document).querySelector('.foo'); // LiveNodeList
``` 

### getElementsByTagName

`LiveNodeList getElementsByTagName(String tagName)` 

See [`getElementsByTagName`](http://devdocs.io/dom/element.getelementsbytagname) for details. Should be faster than
the query selectors, as **watched.js** uses the native live nodelist internally to get the elements you want.

```js
var links = watched(document).querySelector('a'); // LiveNodeList
``` 

### getElementsByClassName

`LiveNodeList getElementsByClassName(String className)` 

See [`getElementsByClassName`](http://devdocs.io/dom/document.getelementsbyclassname) for details. Should be faster
than the query selectors, as **watched.js** uses the native live nodelist internally to get the elements you want.
 
```js
var foos = watched(document).querySelector('foo'); // LiveNodeList
``` 

<br><br>

## LiveNodeList

A live list of dom elements, always up to date.

It's a live list, similar to the list returned by `getElementsBy(Tag|Class)Name`. But other than these queries,
the `LiveNodeList` dispatches event on changes!

It's an event emitter, dispatching events if the `LiveNodeList` changes.

### Events
#### changed

`LiveNodeList event`

Event called when new elements are added to or removed from the dom

The event listeners callback will be called with one argument: an array containing all elements currently in the list

```js
nodeList.on('changed', function(currentElements){
  console.log(currentElements);
});
```
<br>

#### added

`LiveNodeList event`   

Event called when new elements are added to the dom

The event listeners callback will be called with one argument: an array containing the newly found dom elements

```js
nodeList.on('added', function(newElements){
  console.log(newElements);
});
```
<br>

#### removed

`LiveNodeList event`

Event called when elements are removed from the dom

The event listeners callback will be called with one argument: an array `removedElements` containing the dom elements removed from the list (removed from the dom)

```js
nodeList.on('removed', function(removedElements){
  console.log(removedElements);
});
```
<br><br>

------

### length

`Number length`

The length of the node list.

you can't set the length, so tricks known to work with the native array won't have any effect here*


### on
`on(String event, Function callback)`

Add an event listener to the LiveNodeList


### once
`once(String event, Function callback)`

Add an event listener to the LiveNodeList that will only be called once

### off
`off(String event, [Function callback])`

Removes an event listener from the LiveNodeList

### emit
`emit(String event, ...eventData)`

Emit an event.

Normally you don't do that, but it's part of the `LiveNodeList`'s prototype, so it's documented here

### forEach

`forEach(Function callback, Object thisArg)`

see the native [`Array.forEach`](http://devdocs.io/javascript/global_objects/array/foreach) for details.

```js
nodeList.forEach(function(element){
  element.style.color = "green";
});
```

### pause

`pause()`

Freezes the nodelist in it's current form and pauses the dom mutation listener

### resume

`resume()`

Resume the query and listen to dom mutations again.
Creating a LiveNodeList will do that initially for you.



