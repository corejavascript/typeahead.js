(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Promise = factory());
}(this, (function () { 'use strict';

  function getBuiltInPromise() {
    if (typeof Promise !== "undefined" && Promise.resolve && Promise.reject && Promise.all && Promise.prototype.then && Promise.prototype.catch) {
      return Promise;
    } else {
      return null;
    }
  }

  function createPolyfillPromise() {
    var builtInProp, cycle, scheduling_queue,
        ToString = Object.prototype.toString,
        timer = (typeof setImmediate != "undefined") ?
                function timer(fn) {
                  return setImmediate(fn);
                } :
                setTimeout
        ;
// dammit, IE8.
    try {
      Object.defineProperty({}, "x", {});
      builtInProp = function builtInProp(obj, name, val, config) {
        return Object.defineProperty(obj, name, {
          value: val,
          writable: true,
          configurable: config !== false
        });
      };
    }
    catch (err) {
      builtInProp = function builtInProp(obj, name, val) {
        obj[name] = val;
        return obj;
      };
    }
// Note: using a queue instead of array for efficiency
    scheduling_queue = (function Queue() {
      var first, last, item;

      function Item(fn, self) {
        this.fn = fn;
        this.self = self;
        this.next = void 0;
      }

      return {
        add: function add(fn, self) {
          item = new Item(fn, self);
          if (last) {
            last.next = item;
          }
          else {
            first = item;
          }
          last = item;
          item = void 0;
        },
        drain: function drain() {
          var f = first;
          first = last = cycle = void 0;
          while (f) {
            f.fn.call(f.self);
            f = f.next;
          }
        }
      };
    })();
    function schedule(fn, self) {
      scheduling_queue.add(fn, self);
      if (!cycle) {
        cycle = timer(scheduling_queue.drain);
      }
    }

// promise duck typing
    function isThenable(o) {
      var _then, o_type = typeof o;
      if (o != null &&
          (
          o_type == "object" || o_type == "function"
          )
      ) {
        _then = o.then;
      }
      return typeof _then == "function" ? _then : false;
    }

    function notify() {
      for (var i = 0; i < this.chain.length; i++) {
        notifyIsolated(
            this,
            (this.state === 1) ? this.chain[i].success : this.chain[i].failure,
            this.chain[i]
        );
      }
      this.chain.length = 0;
    }

// NOTE: This is a separate function to isolate
// the `try..catch` so that other code can be
// optimized better
    function notifyIsolated(self, cb, chain) {
      var ret, _then;
      try {
        if (cb === false) {
          chain.reject(self.msg);
        }
        else {
          if (cb === true) {
            ret = self.msg;
          }
          else {
            ret = cb.call(void 0, self.msg);
          }
          if (ret === chain.promise) {
            chain.reject(TypeError("PFPromise-chain cycle"));
          }
          else if (_then = isThenable(ret)) {
            _then.call(ret, chain.resolve, chain.reject);
          }
          else {
            chain.resolve(ret);
          }
        }
      }
      catch (err) {
        chain.reject(err);
      }
    }

    function resolve(msg) {
      var _then, def_wrapper, self = this;
// already triggered?
      if (self.triggered) {
        return;
      }
      self.triggered = true;
// unwrap
      if (self.def) {
        self = self.def;
      }
      try {
        if (_then = isThenable(msg)) {
          def_wrapper = new MakeDefWrapper(self);
          _then.call(msg,
              function $resolve$() {
                resolve.apply(def_wrapper, arguments);
              },
              function $reject$() {
                reject.apply(def_wrapper, arguments);
              }
          );
        }
        else {
          self.msg = msg;
          self.state = 1;
          if (self.chain.length > 0) {
            schedule(notify, self);
          }
        }
      }
      catch (err) {
        reject.call(def_wrapper || (new MakeDefWrapper(self)), err);
      }
    }

    function reject(msg) {
      var self = this;
// already triggered?
      if (self.triggered) {
        return;
      }
      self.triggered = true;
// unwrap
      if (self.def) {
        self = self.def;
      }
      self.msg = msg;
      self.state = 2;
      if (self.chain.length > 0) {
        schedule(notify, self);
      }
    }

    function iteratePFPromises(Constructor, arr, resolver, rejecter) {
      for (var idx = 0; idx < arr.length; idx++) {
        (function IIFE(idx) {
          Constructor.resolve(arr[idx])
              .then(
              function $resolver$(msg) {
                resolver(idx, msg);
              },
              rejecter
          );
        })(idx);
      }
    }

    function MakeDefWrapper(self) {
      this.def = self;
      this.triggered = false;
    }

    function MakeDef(self) {
      this.promise = self;
      this.state = 0;
      this.triggered = false;
      this.chain = [];
      this.msg = void 0;
    }

    function PFPromise(executor) {
      if (typeof executor != "function") {
        throw TypeError("Not a function");
      }
      if (this.__NPO__ !== 0) {
        throw TypeError("Not a promise");
      }
// instance shadowing the inherited "brand"
// to signal an already "initialized" promise
      this.__NPO__ = 1;
      var def = new MakeDef(this);
      this["then"] = function then(success, failure) {
        var o = {
          success: typeof success == "function" ? success : true,
          failure: typeof failure == "function" ? failure : false
        };
// Note: `then(..)` itself can be borrowed to be used against
// a different promise constructor for making the chained promise,
// by substituting a different `this` binding.
        o.promise = new this.constructor(function extractChain(resolve, reject) {
          if (typeof resolve != "function" || typeof reject != "function") {
            throw TypeError("Not a function");
          }
          o.resolve = resolve;
          o.reject = reject;
        });
        def.chain.push(o);
        if (def.state !== 0) {
          schedule(notify, def);
        }
        return o.promise;
      };
      this["catch"] = function $catch$(failure) {
        return this.then(void 0, failure);
      };
      try {
        executor.call(
            void 0,
            function publicResolve(msg) {
              resolve.call(def, msg);
            },
            function publicReject(msg) {
              reject.call(def, msg);
            }
        );
      }
      catch (err) {
        reject.call(def, err);
      }
    }

    var PFPromisePrototype = builtInProp({}, "constructor", PFPromise,
        /*configurable=*/false
    );
// Note: Android 4 cannot use `Object.defineProperty(..)` here
    PFPromise.prototype = PFPromisePrototype;
// built-in "brand" to signal an "uninitialized" promise
    builtInProp(PFPromisePrototype, "__NPO__", 0,
        /*configurable=*/false
    );
    builtInProp(PFPromise, "resolve", function PFPromise$resolve(msg) {
      var Constructor = this;
// spec mandated checks
// note: best "isPromise" check that's practical for now
      if (msg && typeof msg == "object" && msg.__NPO__ === 1) {
        return msg;
      }
      return new Constructor(function executor(resolve, reject) {
        if (typeof resolve != "function" || typeof reject != "function") {
          throw TypeError("Not a function");
        }
        resolve(msg);
      });
    });
    builtInProp(PFPromise, "reject", function PFPromise$reject(msg) {
      return new this(function executor(resolve, reject) {
        if (typeof resolve != "function" || typeof reject != "function") {
          throw TypeError("Not a function");
        }
        reject(msg);
      });
    });
    builtInProp(PFPromise, "all", function PFPromise$all(arr) {
      var Constructor = this;
// spec mandated checks
      if (ToString.call(arr) != "[object Array]") {
        return Constructor.reject(TypeError("Not an array"));
      }
      if (arr.length === 0) {
        return Constructor.resolve([]);
      }
      return new Constructor(function executor(resolve, reject) {
        if (typeof resolve != "function" || typeof reject != "function") {
          throw TypeError("Not a function");
        }
        var len = arr.length, msgs = Array(len), count = 0;
        iteratePFPromises(Constructor, arr, function resolver(idx, msg) {
          msgs[idx] = msg;
          if (++count === len) {
            resolve(msgs);
          }
        }, reject);
      });
    });
    builtInProp(PFPromise, "race", function PFPromise$race(arr) {
      var Constructor = this;
// spec mandated checks
      if (ToString.call(arr) != "[object Array]") {
        return Constructor.reject(TypeError("Not an array"));
      }
      return new Constructor(function executor(resolve, reject) {
        if (typeof resolve != "function" || typeof reject != "function") {
          throw TypeError("Not a function");
        }
        iteratePFPromises(Constructor, arr, function resolver(idx, msg) {
          resolve(msg);
        }, reject);
      });
    });

    PFPromise._timingBehaviorUnspecified = true;

    return PFPromise;
  }

  function addRIAFunctions(ThePromise) {
    function isPromise(promiseOrValue) {
      return promiseOrValue && typeof promiseOrValue.then === "function";
    }

    /**
     * @name luciad.util.Promise.prototype.cancel
     * @function
     * @description Cancels the asynchronous operation that is represented by this Promise.
     * This function is optional and may not be present.  Check before use.
     */
    ThePromise.prototype.cancel = function() {
    };

    /**
     * @name then
     * @memberOf luciad.util.Promise#
     * @function
     * @description Adds a resolvedCallback, errorCallback, and progressCallback to be called for completion of a promise.
     *              The resolvedCallback is called when the promise is fulfilled. The errorCallback is called when a promise
     *              fails. If the resolvedCallback is invoked the errorCallback can never be invoked and vice versa.
     *              The progressCallback is called for progress events. All arguments are optional and non-function\
     *              values are ignored. The progressCallback is not only an optional argument, but progress events are purely
     *              optional. Promise implementors are not required to ever call a progressCallback (the progressCallback
     *              may be ignored), this parameter exists so that implementors may call it if they have progress events to
     *              report.
     * @param {Function} [resolvedCallback] the function to call when the promise is resolved.
     * This function must accept a single parameter. This parameter is the "value" of the promise. In effect,
     * the promise-object is a future for this value.
     * @param {Function} [errorCallback] the function to call when the promise has failed to resolve.
     * This function must accept a single parameter. This parameter is the "error" of the promise.
     * @param {Function} [progressCallback] the function to call when updates have been made in resolving the promise.
     * The function must accept at least one parameter. This parameter is the progress event of the promise.
     * @return a new promise that is fulfilled when the given resolvedCallback or errorCallback callback is finished
     *
     *
     * @example
     * var aPromiseForAnAsyncValue = someAsyncAPICall();
     *
     * aPromiseForAnAsyncValue.then(function(value){
     *   //this function is called when the "value" parameter is available.
     * },function(error){
     *   //this function is called when an error occurred during the handling of "someAsyncAPICall".
     * });;
     */

    /**
     * @name catch
     * @memberOf luciad.util.Promise#
     * @function
     * @description The catch() method returns a Promise and deals with rejected cases only. It behaves the same as calling Promise.prototype.then(undefined, failure).
     * @param {Function} failure A Function called when the Promise is rejected. This function has one argument, the rejection reason.
     * @returns {luciad.util.Promise} A Promise object.
     */

    /**
     * @name when
     * @memberOf luciad.util.Promise
     * @function
     * @description Provides the ability to define a callback (and error handler) for any standard synchronous value.
     * @param {Object} value a value.
     * @param {Function} [resolvedCallback] a function called with as parameter the value of the first parameter of this function.
     * @param {Function} [errorCallback] the function to call when the promise has failed to resolve.
     * @param {Function} [progressCallback] the function to call when updates have been made in resolving the promise.
     * @returns the result of resolvedCallback. If the resolvedCallback parameter was not given, it returns a promise for the value.
     */
    /**
     * @name when^2
     * @memberOf luciad.util.Promise
     * @function
     * @description Provides the ability to define a callback (and error handler) for the eventual completion of the Promise.
     * @param {luciad.util.Promise} promise a promise.
     * @param {Function} [resolvedCallback] the function to call when the promise is resolved. The parameter to this function is the promised value represented by the promise.
     * @param {Function} [errorCallback] the function to call when the promise has failed to resolve
     * @param {Function} [progressCallback] the function to call when updates have been made in resolving the promise.
     * @returns a new promise that represents the result of the execution of resolvedCallback. If the resolvedCallback parameter was not given, it returns the promise itself.
     */
    ThePromise.when = function(promiseOrValue, resolvedCallback, errorCallback, progressCallback) {
      //RIA-294:
      //preserve currently documented usage, but provide a 3rd overload which will allow us to truly use
      //.when as a polymorph function.
      //will be more in line with dojo.

      if (isPromise(promiseOrValue)) {
        if (resolvedCallback || errorCallback || progressCallback) {
          return promiseOrValue.then(resolvedCallback, errorCallback, progressCallback);
        } else {
          return promiseOrValue;
        }
      }

      if (resolvedCallback) {
        return resolvedCallback(promiseOrValue);
      } else {
        return ThePromise.resolve(promiseOrValue);
      }
    };

    /**
     * @name isPromise
     * @memberOf luciad.util.Promise
     * @function
     * @description Determines if the given value is a promise or an actual value.
     * @param {luciad.util.Promise|Object} promiseOrValue
     * @returns true if the value is a promise; false otherwise
     */
    ThePromise.isPromise = isPromise;

    /**
     * Creates a promise holder.
     *
     * @private
     * @function
     * @memberOf luciad.util.Promise#
     * @name createPromiseHolder
     * @returns {Promise} promise object
     */
    ThePromise.createPromiseHolder = function() {
      var holder = {
        promise: null,
        resolve: null,
        reject: null
      };
      holder.promise = new ThePromise(function(resolve, reject) {
        holder.resolve = resolve;
        holder.reject = reject;
      });
      return holder;
    };

    return ThePromise;
  }

  return addRIAFunctions(getBuiltInPromise() || createPolyfillPromise());
})));
