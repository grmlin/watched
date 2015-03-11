watched.js
==========

Live, event driven dom element collections 

- [Website](http://grmlin.github.io/watched/)
- [Demo](http://grmlin.github.io/watched/demo.html)

## Installation

### NPM

	$ npm install watched --save

### Bower

   $ bower install watched
   
   
### Download 

Download from `/dist`

## Load

Node/Browserify

	var watched = require('watched');
	
Browser

	<script src="watched.js"></script>
	
AMD

*TODO*


## Usage

**The watched nodelists only contain elements that are part of the visual dom**. So if you remove 
the parent element of, or the watched element itself, the nodelist will be empty.  
If once removed element are stored somewhere and are later re-added to the dom, the lists may be filled again.

```javascript
// give me nodelists

// quick
var foos  = watched('.foo'); 
// or more specific
var foos2 = watched(document).querySelectorAll('.foo'); // same as watched('.foo')
var bars  = watched(document).querySelector('.bar');
var bazs  = watched(document).getElementsByClassName('baz');
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

In either case only a single mutation observer will be created for the scripts lifespan. All `LiveNodeList` instances will listen to this one observer. 


## Important notes

- **Only elements in the visual dom are affected.** Whenever an element or it's parent is removed from the dom, it will be removed from the live nodelist

- **The dom mutation listener is debounced!** That's why massive changes to the dom will happen in batches, not individually, and take some time. (20ms at the moment)

- **Always use the ` added`, `removed` and `changed` events!** The node lists are live and bound to changes in the dom, but never called synchronously after the dom changed (see debouncing above). 

- **The fallback is slower than native!** It uses an intervall to scan for changes. It's not a good idea to do this too often, so the current timeout is set to 500ms. 

- **The magic might become expensive!** You better not use hundreds of live nodelists, they will all be updated and the queries re-evaluated in the background, when the dom changes!


## Thanks

- [DECAF](http://decaf.de/)
- [smokesignals.js](https://bitbucket.org/bentomas/smokesignals.js/) - used as event emitter
