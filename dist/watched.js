!function e(r,t,n){function o(u,f){if(!t[u]){if(!r[u]){var c="function"==typeof require&&require;if(!f&&c)return c(u,!0);if(i)return i(u,!0);var a=new Error("Cannot find module '"+u+"'");throw a.code="MODULE_NOT_FOUND",a}var l=t[u]={exports:{}};r[u][0].call(l.exports,function(e){var t=r[u][1][e];return o(t?t:e)},l,l.exports,e,r,t,n)}return t[u].exports}for(var i="function"==typeof require&&require,u=0;u<n.length;u++)o(n[u]);return o}({1:[function(){var e=function(e){if(isInvalidDomElement(e))throw new TypeError("changed.js: the element to watch has to be a HTMLElement!");this._el=e};AVAILABLE_QUERIES.forEach(function(r){Object.defineProperty(e.prototype,r,{value:function(e){var t=QueryStrategyFactory.create(r,this._el,e),n=new DomQuery(t);return new LiveNodeList(n)}})})},{}],2:[function(e,r){var t=e("./DomElement"),n=function(e){return"string"==typeof e?new t(doc).querySelectorAll(e):new t(e)};r.exports=n},{"./DomElement":1}]},{},[2]);
//# sourceMappingURL=watched.js.map