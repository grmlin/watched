no_nav: true

# watched.js

<div class="lead">
Live, event driven dom element collections
</div>
<p>
GREMLIN.JS is a dependency-free library to build web components. Web components for boringly normal websites, all your
websites. Webapps are not for everyone and everything, but modular and well organized code is.
</p>


``` javascript
var watched = require('watched');
watched('.foo').on('changed', function(currentElements){
    console.log(currentElements);
});
```

## Installation

### NPM

    $ npm install watched --save
    
### Bower

    $ bower install watched
    
### Classic
[Download](https://github.com/grmlin/watched/releases) the latest release and include it

     <script src="watched.min.js" />
    
## Usage

```js
// give me nodelists
var watched = require('watched');
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
    
<br><br><br>