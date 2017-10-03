/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

var _ = (function() {
  'use strict';

  return {
    isMsie: function() {
      // from https://github.com/ded/bowser/blob/master/bowser.js
      return (/(msie|trident)/i).test(navigator.userAgent) ?
        navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
    },

    isBlankString: function(str) { return !str || /^\s*$/.test(str); },

    // http://stackoverflow.com/a/6969486
    escapeRegExChars: function(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    },

    isString: function(obj) { return typeof obj === 'string'; },

    isNumber: function(obj) { return typeof obj === 'number'; },

    isFunction: function(obj) { return typeof obj === "function" },

    isObject: function( obj ) {
  		var proto, Ctor, hasOwn = ({}).hasOwnProperty;
  		// Detect obvious negatives
  		// Use toString instead of jQuery.type to catch host objects
  		if ( !obj || {}.toString.call( obj ) !== "[object Object]" ) {
  			return false;
  		}

  		proto = Object.getPrototypeOf( obj );

  		// Objects with no prototype (e.g., `Object.create( null )`) are plain
  		if ( !proto ) {
  			return true;
  		}

  		// Objects with prototype are plain iff they were constructed by a global Object function
  		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
  		return typeof Ctor === "function" && hasOwn.toString.call( Ctor ) === hasOwn.toString.call( Object );
  	},

    isUndefined: function(obj) { return typeof obj === 'undefined'; },

    isElement: function(obj) { return !!(obj && obj.nodeType === 1); },

    toStr: function toStr(s) {
      return (_.isUndefined(s) || s === null) ? '' : s + '';
    },

    bind: function( fn, context ) {
  		var tmp, args, proxy;

  		if ( typeof context === "string" ) {
  			tmp = fn[ context ];
  			context = fn;
  			fn = tmp;
  		}

  		// Quick check to determine if target is callable, in the spec
  		// this throws a TypeError, but we will just return undefined.
  		if ( !this.isFunction( fn ) ) {
  			return undefined;
  		}

  		// Simulated bind
  		args = [].slice.call( arguments, 2 );
  		proxy = function() {
  			return fn.apply( context || this, args.concat( [].slice.call( arguments ) ) );
  		};

      // Set the guid of unique handler to the same of original handler, so it can be removed
      proxy.guid = fn.guid = fn.guid || this.guid();

  		return proxy;
  	},

    each: function(collection, cb) {
      (function( obj, callback ) {
    		var length, i = 0;
    		if ( Array.isArray( obj ) ) {
    			length = obj.length;
    			for ( ; i < length; i++ ) {
    				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
    					break;
    				}
    			}
    		} else {
    			for ( i in obj ) {
    				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
    					break;
    				}
    			}
    		}
    		return obj;
    	})(collection, function(index, value) { return cb(value, index); });
    },

    map: function( elems, callback, arg ) {
  		var length, value, i = 0, ret = [];
  		// Go through the array, translating each of the items to their new values
  		if ( Array.isArray( elems ) ) {
  			length = elems.length;
  			for ( ; i < length; i++ ) {
  				value = callback( elems[ i ], i, arg );
  				if ( value != null ) {
  					ret.push( value );
  				}
  			}
  		// Go through every key on the object,
  		} else {
  			for ( i in elems ) {
  				value = callback( elems[ i ], i, arg );
  				if ( value != null ) {
  					ret.push( value );
  				}
  			}
  		}
  		// Flatten any nested arrays
  		return [].concat.apply( [], ret );
  	},

    filter: function( elems, callback, invert ) {
  		var callbackInverse, matches = [], i = 0, length = elems.length, callbackExpect = !invert;
  		// Go through the array, only saving the items
  		// that pass the validator function
  		for ( ; i < length; i++ ) {
  			callbackInverse = !callback( elems[ i ], i );
  			if ( callbackInverse !== callbackExpect ) {
  				matches.push( elems[ i ] );
  			}
  		}
  		return matches;
  	},

    every: function(obj, test) {
      var result = true;
      if (!obj) { return result; }
      this.each(obj, function(val, key) {
        if (!(result = test.call(null, val, key, obj))) {
          return false;
        }
      });

      return !!result;
    },

    some: function(obj, test) {
      var result = false;

      if (!obj) { return result; }

      this.each(obj, function(val, key) {
        if (result = test.call(null, val, key, obj)) {
          return false;
        }
      });

      return !!result;
    },

    mixin: function() {
    	var options, name, src, copy, copyIsArray, clone,
    		target = arguments[ 0 ] || {}, i = 1, length = arguments.length, deep = false;

    	// Handle a deep copy situation
    	if ( typeof target === "boolean" ) {
    		deep = target;
    		// Skip the boolean and the target
    		target = arguments[ i ] || {};
    		i++;
    	}

    	// Handle case when target is a string or something (possible in deep copy)
    	if ( typeof target !== "object" && !this.isFunction( target ) ) {
    		target = {};
    	}

    	// Extend this object itself if only one argument is passed
    	if ( i === length ) {
    		target = this;
    		i--;
    	}

    	for ( ; i < length; i++ ) {
    		// Only deal with non-null/undefined values
    		if ( ( options = arguments[ i ] ) != null ) {
    			// Extend the base object
    			for ( name in options ) {
    				src = target[ name ];
    				copy = options[ name ];
    				// Prevent never-ending loop
    				if ( target === copy ) {
    					continue;
    				}
    				// Recurse if we're merging plain objects or arrays
    				if ( deep && copy && ( this.isObject( copy ) ||
    					( copyIsArray = Array.isArray( copy ) ) ) ) {

    					if ( copyIsArray ) {
    						copyIsArray = false;
    						clone = src && Array.isArray( src ) ? src : [];

    					} else {
    						clone = src && this.isObject( src ) ? src : {};
    					}

    					// Never move original objects, clone them
    					target[ name ] = this.extend( deep, clone, copy );

    				// Don't bring in undefined values
    				} else if ( copy !== undefined ) {
    					target[ name ] = copy;
    				}
    			}
    		}
    	}
    	// Return the modified object
    	return target;
    },

    identity: function(x) { return x; },

    clone: function(obj) { return this.extend(true, {}, obj); },

    getIdGenerator: function() {
      var counter = 0;
      return function() { return counter++; };
    },

    templatify: function templatify(obj) {
      return this.isFunction(obj) ? obj : template;
      function template() { return String(obj); }
    },

    defer: function(fn) { setTimeout(fn, 0); },

    debounce: function(func, wait, immediate) {
      var timeout, result;

      return function() {
        var context = this, args = arguments, later, callNow;

        later = function() {
          timeout = null;
          if (!immediate) { result = func.apply(context, args); }
        };

        callNow = immediate && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) { result = func.apply(context, args); }

        return result;
      };
    },

    throttle: function(func, wait) {
      var context, args, timeout, result, previous, later;

      previous = 0;
      later = function() {
        previous = new Date();
        timeout = null;
        result = func.apply(context, args);
      };

      return function() {
        var now = new Date(),
            remaining = wait - (now - previous);

        context = this;
        args = arguments;

        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
        }

        else if (!timeout) {
          timeout = setTimeout(later, remaining);
        }

        return result;
      };
    },

    stringify: function(val) {
      return _.isString(val) ? val : JSON.stringify(val);
    },

    guid: function() {
      function _p8(s) {
        var p = (Math.random().toString(16)+'000000000').substr(2,8);
        return s ? '-' + p.substr(0,4) + '-' + p.substr(4,4) : p ;
      }
      return 'tt-' + _p8() + _p8(true) + _p8(true) + _p8();
    },

    noop: function() {}
  };
})();
