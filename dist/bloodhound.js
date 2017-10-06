/*!
 * typeahead.js 1.2.1
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2017 Twitter, Inc. and other contributors; Licensed MIT
 */


(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return root["Bloodhound"] = factory();
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root["Bloodhound"] = factory();
    }
})(this, function() {
    var _ = function() {
        "use strict";
        return {
            isMsie: function() {
                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
            },
            isBlankString: function(str) {
                return !str || /^\s*$/.test(str);
            },
            escapeRegExChars: function(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            isNumber: function(obj) {
                return typeof obj === "number";
            },
            isArray: Array.isArray,
            isFunction: function(obj) {
                return typeof obj === "function";
            },
            isObject: function(obj) {
                var proto, Ctor, hasOwn = {}.hasOwnProperty;
                if (!obj || {}.toString.call(obj) !== "[object Object]") {
                    return false;
                }
                proto = Object.getPrototypeOf(obj);
                if (!proto) {
                    return true;
                }
                Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
                return typeof Ctor === "function" && hasOwn.toString.call(Ctor) === hasOwn.toString.call(Object);
            },
            isUndefined: function(obj) {
                return typeof obj === "undefined";
            },
            isElement: function(obj) {
                return !!(obj && obj.nodeType === 1);
            },
            isJQuery: function(obj) {
                return obj instanceof $;
            },
            toStr: function toStr(s) {
                return _.isUndefined(s) || s === null ? "" : s + "";
            },
            bind: function(fn, context) {
                var tmp, args, proxy;
                if (typeof context === "string") {
                    tmp = fn[context];
                    context = fn;
                    fn = tmp;
                }
                if (!this.isFunction(fn)) {
                    return undefined;
                }
                args = [].slice.call(arguments, 2);
                proxy = function() {
                    return fn.apply(context || this, args.concat([].slice.call(arguments)));
                };
                proxy.guid = fn.guid = fn.guid || this.guid();
                return proxy;
            },
            each: function(collection, cb) {
                (function(obj, callback) {
                    var length, i = 0;
                    if (Array.isArray(obj)) {
                        length = obj.length;
                        for (;i < length; i++) {
                            if (callback.call(obj[i], i, obj[i]) === false) {
                                break;
                            }
                        }
                    } else {
                        for (i in obj) {
                            if (callback.call(obj[i], i, obj[i]) === false) {
                                break;
                            }
                        }
                    }
                    return obj;
                })(collection, function(index, value) {
                    return cb(value, index);
                });
            },
            map: function(elems, callback, arg) {
                var length, value, i = 0, ret = [];
                if (Array.isArray(elems)) {
                    length = elems.length;
                    for (;i < length; i++) {
                        value = callback(elems[i], i, arg);
                        if (value != null) {
                            ret.push(value);
                        }
                    }
                } else {
                    for (i in elems) {
                        value = callback(elems[i], i, arg);
                        if (value != null) {
                            ret.push(value);
                        }
                    }
                }
                return [].concat.apply([], ret);
            },
            filter: function(elems, callback, invert) {
                var callbackInverse, matches = [], i = 0, length = elems.length, callbackExpect = !invert;
                for (;i < length; i++) {
                    callbackInverse = !callback(elems[i], i);
                    if (callbackInverse !== callbackExpect) {
                        matches.push(elems[i]);
                    }
                }
                return matches;
            },
            every: function(obj, test) {
                var result = true;
                if (!obj) {
                    return result;
                }
                this.each(obj, function(val, key) {
                    if (!(result = test.call(null, val, key, obj))) {
                        return false;
                    }
                });
                return !!result;
            },
            some: function(obj, test) {
                var result = false;
                if (!obj) {
                    return result;
                }
                this.each(obj, function(val, key) {
                    if (result = test.call(null, val, key, obj)) {
                        return false;
                    }
                });
                return !!result;
            },
            mixin: function() {
                var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
                if (typeof target === "boolean") {
                    deep = target;
                    target = arguments[i] || {};
                    i++;
                }
                if (typeof target !== "object" && !this.isFunction(target)) {
                    target = {};
                }
                if (i === length) {
                    target = this;
                    i--;
                }
                for (;i < length; i++) {
                    if ((options = arguments[i]) != null) {
                        for (name in options) {
                            src = target[name];
                            copy = options[name];
                            if (target === copy) {
                                continue;
                            }
                            if (deep && copy && (this.isObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                                if (copyIsArray) {
                                    copyIsArray = false;
                                    clone = src && Array.isArray(src) ? src : [];
                                } else {
                                    clone = src && this.isObject(src) ? src : {};
                                }
                                target[name] = this.mixin(deep, clone, copy);
                            } else if (copy !== undefined) {
                                target[name] = copy;
                            }
                        }
                    }
                }
                return target;
            },
            identity: function(x) {
                return x;
            },
            clone: function(obj) {
                return this.mixin(true, {}, obj);
            },
            getIdGenerator: function() {
                var counter = 0;
                return function() {
                    return counter++;
                };
            },
            templatify: function templatify(obj) {
                return this.isFunction(obj) ? obj : template;
                function template() {
                    return String(obj);
                }
            },
            defer: function(fn) {
                setTimeout(fn, 0);
            },
            debounce: function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments, later, callNow;
                    later = function() {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                        }
                    };
                    callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                    }
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
                    var now = new Date(), remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            stringify: function(val) {
                return _.isString(val) ? val : JSON.stringify(val);
            },
            ajax: function(opts, onSuccess, onFailure) {
                var that = _, url;
                if (_.isObject(opts)) {
                    url = opts.url;
                } else {
                    url = opts;
                    opts = {};
                }
                var deferred = Deferred();
                (function(onSuccess, onFailure) {
                    var req = new XMLHttpRequest();
                    req.open(opts.type || "GET", url);
                    req.responseType = opts.responseType || opts.dataType || "json";
                    opts.headers && function(req, headers) {
                        for (var key in headers) {
                            req.setRequestHeader(key, headers[key]);
                        }
                    }(req, opts.headers);
                    opts.listeners && function(req, listeners) {
                        for (var key in listeners) {
                            req.addEventListener(key, listeners[key], false);
                        }
                    }(req, opts.listeners);
                    req.onload = function() {
                        if (req.status == 200) {
                            onSuccess(req.response);
                        } else {
                            onFailure(req.statusText);
                        }
                    };
                    req.onerror = function() {
                        onFailure("Network Error");
                    };
                    req.send();
                    return req;
                })(function(resp) {
                    that.defer(function() {
                        onSuccess(resp);
                        deferred.resolve(resp);
                    });
                }, function(err) {
                    that.defer(function() {
                        onFailure(err);
                        deferred.reject(err);
                    });
                });
                return deferred;
            },
            param: function(a) {
                var prefix, s = [], that = this, buildParams = function(prefix, obj, add) {
                    var name;
                    if (Array.isArray(obj)) {
                        that.each(obj, function(v, i) {
                            if (/\[\]$/.test(prefix)) {
                                add(prefix, v);
                            } else {
                                buildParams(prefix + "[" + (typeof v === "object" && v != null ? i : "") + "]", v, add);
                            }
                        });
                    } else if (that.type(obj) === "object") {
                        for (name in obj) {
                            buildParams(prefix + "[" + name + "]", obj[name], add);
                        }
                    } else {
                        add(prefix, obj);
                    }
                }, add = function(key, valueOrFunction) {
                    var value = this.isFunction(valueOrFunction) ? valueOrFunction() : valueOrFunction;
                    s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value == null ? "" : value);
                };
                for (prefix in a) {
                    buildParams(prefix, a[prefix], add);
                }
                return s.join("&");
            },
            guid: function() {
                function _p8(s) {
                    var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                    return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
                }
                return "tt-" + _p8() + _p8(true) + _p8(true) + _p8();
            },
            noop: function() {}
        };
    }();
    var VERSION = "1.2.1";
    (function() {
        var Deferred, PENDING, REJECTED, RESOLVED, VERSION, _when, after, execute, flatten, has, installInto, isArguments, isPromise, wrap, slice = [].slice;
        VERSION = "3.1.0";
        PENDING = "pending";
        RESOLVED = "resolved";
        REJECTED = "rejected";
        has = function(obj, prop) {
            return obj != null ? obj.hasOwnProperty(prop) : void 0;
        };
        isArguments = function(obj) {
            return has(obj, "length") && has(obj, "callee");
        };
        isPromise = function(obj) {
            return has(obj, "promise") && typeof (obj != null ? obj.promise : void 0) === "function";
        };
        flatten = function(array) {
            if (isArguments(array)) {
                return flatten(Array.prototype.slice.call(array));
            }
            if (!Array.isArray(array)) {
                return [ array ];
            }
            return array.reduce(function(memo, value) {
                if (Array.isArray(value)) {
                    return memo.concat(flatten(value));
                }
                memo.push(value);
                return memo;
            }, []);
        };
        after = function(times, func) {
            if (times <= 0) {
                return func();
            }
            return function() {
                if (--times < 1) {
                    return func.apply(this, arguments);
                }
            };
        };
        wrap = function(func, wrapper) {
            return function() {
                var args;
                args = [ func ].concat(Array.prototype.slice.call(arguments, 0));
                return wrapper.apply(this, args);
            };
        };
        execute = function(callbacks, args, context) {
            var callback, i, len, ref, results;
            ref = flatten(callbacks);
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
                callback = ref[i];
                results.push(callback.call.apply(callback, [ context ].concat(slice.call(args))));
            }
            return results;
        };
        Deferred = function() {
            var candidate, close, closingArguments, doneCallbacks, failCallbacks, progressCallbacks, state;
            state = PENDING;
            doneCallbacks = [];
            failCallbacks = [];
            progressCallbacks = [];
            closingArguments = {
                resolved: {},
                rejected: {},
                pending: {}
            };
            this.promise = function(candidate) {
                var pipe, storeCallbacks;
                candidate = candidate || {};
                candidate.state = function() {
                    return state;
                };
                storeCallbacks = function(shouldExecuteImmediately, holder, holderState) {
                    return function() {
                        if (state === PENDING) {
                            holder.push.apply(holder, flatten(arguments));
                        }
                        if (shouldExecuteImmediately()) {
                            execute(arguments, closingArguments[holderState]);
                        }
                        return candidate;
                    };
                };
                candidate.done = storeCallbacks(function() {
                    return state === RESOLVED;
                }, doneCallbacks, RESOLVED);
                candidate.fail = storeCallbacks(function() {
                    return state === REJECTED;
                }, failCallbacks, REJECTED);
                candidate.progress = storeCallbacks(function() {
                    return state !== PENDING;
                }, progressCallbacks, PENDING);
                candidate.always = function() {
                    var ref;
                    return (ref = candidate.done.apply(candidate, arguments)).fail.apply(ref, arguments);
                };
                pipe = function(doneFilter, failFilter, progressFilter) {
                    var filter, master;
                    master = new Deferred();
                    filter = function(source, funnel, callback) {
                        if (!callback) {
                            return candidate[source](master[funnel]);
                        }
                        return candidate[source](function() {
                            var args, value;
                            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                            value = callback.apply(null, args);
                            if (isPromise(value)) {
                                return value.done(master.resolve).fail(master.reject).progress(master.notify);
                            } else {
                                return master[funnel](value);
                            }
                        });
                    };
                    filter("done", "resolve", doneFilter);
                    filter("fail", "reject", failFilter);
                    filter("progress", "notify", progressFilter);
                    return master;
                };
                candidate.pipe = pipe;
                candidate.then = pipe;
                if (candidate.promise == null) {
                    candidate.promise = function() {
                        return candidate;
                    };
                }
                return candidate;
            };
            this.promise(this);
            candidate = this;
            close = function(finalState, callbacks, context) {
                return function() {
                    if (state === PENDING) {
                        state = finalState;
                        closingArguments[finalState] = arguments;
                        execute(callbacks, closingArguments[finalState], context);
                        return candidate;
                    }
                    return this;
                };
            };
            this.resolve = close(RESOLVED, doneCallbacks);
            this.reject = close(REJECTED, failCallbacks);
            this.notify = close(PENDING, progressCallbacks);
            this.resolveWith = function(context, args) {
                return close(RESOLVED, doneCallbacks, context).apply(null, args);
            };
            this.rejectWith = function(context, args) {
                return close(REJECTED, failCallbacks, context).apply(null, args);
            };
            this.notifyWith = function(context, args) {
                return close(PENDING, progressCallbacks, context).apply(null, args);
            };
            return this;
        };
        _when = function() {
            var def, defs, finish, i, len, resolutionArgs, trigger;
            defs = Array.prototype.slice.apply(arguments);
            if (defs.length === 1) {
                if (isPromise(defs[0])) {
                    return defs[0];
                } else {
                    return new Deferred().resolve(defs[0]).promise();
                }
            }
            trigger = new Deferred();
            if (!defs.length) {
                return trigger.resolve().promise();
            }
            resolutionArgs = [];
            finish = after(defs.length, function() {
                return trigger.resolve.apply(trigger, resolutionArgs);
            });
            defs.forEach(function(def, index) {
                if (isPromise(def)) {
                    return def.done(function() {
                        var args;
                        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                        resolutionArgs[index] = args.length > 1 ? args : args[0];
                        return finish();
                    });
                } else {
                    resolutionArgs[index] = def;
                    return finish();
                }
            });
            for (i = 0, len = defs.length; i < len; i++) {
                def = defs[i];
                isPromise(def) && def.fail(trigger.reject);
            }
            return trigger.promise();
        };
        installInto = function(fw) {
            fw.Deferred = function() {
                return new Deferred();
            };
            fw.ajax = wrap(fw.ajax, function(ajax, options) {
                var createWrapper, def, promise, xhr;
                if (options == null) {
                    options = {};
                }
                def = new Deferred();
                createWrapper = function(wrapped, finisher) {
                    return wrap(wrapped, function() {
                        var args, func;
                        func = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
                        if (func) {
                            func.apply(null, args);
                        }
                        return finisher.apply(null, args);
                    });
                };
                options.success = createWrapper(options.success, def.resolve);
                options.error = createWrapper(options.error, def.reject);
                xhr = ajax(options);
                promise = def.promise();
                promise.abort = function() {
                    return xhr.abort();
                };
                return promise;
            });
            return fw.when = _when;
        };
        if (typeof exports !== "undefined") {
            exports.Deferred = function() {
                return new Deferred();
            };
            exports.when = _when;
            exports.installInto = installInto;
        } else if (typeof define === "function" && define.amd) {
            define(function() {
                if (typeof Zepto !== "undefined") {
                    return installInto(Zepto);
                } else {
                    Deferred.when = _when;
                    Deferred.installInto = installInto;
                    return Deferred;
                }
            });
        } else if (typeof Zepto !== "undefined") {
            installInto(Zepto);
        } else {
            this.Deferred = function() {
                return new Deferred();
            };
            this.Deferred.when = _when;
            this.Deferred.installInto = installInto;
        }
    }).call(this);
    var tokenizers = function() {
        "use strict";
        return {
            nonword: nonword,
            whitespace: whitespace,
            ngram: ngram,
            obj: {
                nonword: getObjTokenizer(nonword),
                whitespace: getObjTokenizer(whitespace),
                ngram: getObjTokenizer(ngram)
            }
        };
        function whitespace(str) {
            str = _.toStr(str);
            return str ? str.split(/\s+/) : [];
        }
        function nonword(str) {
            str = _.toStr(str);
            return str ? str.split(/\W+/) : [];
        }
        function ngram(str) {
            str = _.toStr(str);
            var tokens = [], word = "";
            _.each(str.split(""), function(char) {
                if (char.match(/\s+/)) {
                    word = "";
                } else {
                    tokens.push(word + char);
                    word += char;
                }
            });
            return tokens;
        }
        function getObjTokenizer(tokenizer) {
            return function setKey(keys) {
                keys = _.isArray(keys) ? keys : [].slice.call(arguments, 0);
                return function tokenize(o) {
                    var tokens = [];
                    _.each(keys, function(k) {
                        tokens = tokens.concat(tokenizer(_.toStr(o[k])));
                    });
                    return tokens;
                };
            };
        }
    }();
    var LruCache = function() {
        "use strict";
        function LruCache(maxSize) {
            this.maxSize = _.isNumber(maxSize) ? maxSize : 100;
            this.reset();
            if (this.maxSize <= 0) {
                this.set = this.get = _.noop;
            }
        }
        _.mixin(LruCache.prototype, {
            set: function set(key, val) {
                var tailItem = this.list.tail, node;
                if (this.size >= this.maxSize) {
                    this.list.remove(tailItem);
                    delete this.hash[tailItem.key];
                    this.size--;
                }
                if (node = this.hash[key]) {
                    node.val = val;
                    this.list.moveToFront(node);
                } else {
                    node = new Node(key, val);
                    this.list.add(node);
                    this.hash[key] = node;
                    this.size++;
                }
            },
            get: function get(key) {
                var node = this.hash[key];
                if (node) {
                    this.list.moveToFront(node);
                    return node.val;
                }
            },
            reset: function reset() {
                this.size = 0;
                this.hash = {};
                this.list = new List();
            }
        });
        function List() {
            this.head = this.tail = null;
        }
        _.mixin(List.prototype, {
            add: function add(node) {
                if (this.head) {
                    node.next = this.head;
                    this.head.prev = node;
                }
                this.head = node;
                this.tail = this.tail || node;
            },
            remove: function remove(node) {
                node.prev ? node.prev.next = node.next : this.head = node.next;
                node.next ? node.next.prev = node.prev : this.tail = node.prev;
            },
            moveToFront: function(node) {
                this.remove(node);
                this.add(node);
            }
        });
        function Node(key, val) {
            this.key = key;
            this.val = val;
            this.prev = this.next = null;
        }
        return LruCache;
    }();
    var PersistentStorage = function() {
        "use strict";
        var LOCAL_STORAGE;
        try {
            LOCAL_STORAGE = window.localStorage;
            LOCAL_STORAGE.setItem("~~~", "!");
            LOCAL_STORAGE.removeItem("~~~");
        } catch (err) {
            LOCAL_STORAGE = null;
        }
        function PersistentStorage(namespace, override) {
            this.prefix = [ "__", namespace, "__" ].join("");
            this.ttlKey = "__ttl__";
            this.keyMatcher = new RegExp("^" + _.escapeRegExChars(this.prefix));
            this.ls = override || LOCAL_STORAGE;
            !this.ls && this._noop();
        }
        _.mixin(PersistentStorage.prototype, {
            _prefix: function(key) {
                return this.prefix + key;
            },
            _ttlKey: function(key) {
                return this._prefix(key) + this.ttlKey;
            },
            _noop: function() {
                this.get = this.set = this.remove = this.clear = this.isExpired = _.noop;
            },
            _safeSet: function(key, val) {
                try {
                    this.ls.setItem(key, val);
                } catch (err) {
                    if (err.name === "QuotaExceededError") {
                        this.clear();
                        this._noop();
                    }
                }
            },
            get: function(key) {
                if (this.isExpired(key)) {
                    this.remove(key);
                }
                return decode(this.ls.getItem(this._prefix(key)));
            },
            set: function(key, val, ttl) {
                if (_.isNumber(ttl)) {
                    this._safeSet(this._ttlKey(key), encode(now() + ttl));
                } else {
                    this.ls.removeItem(this._ttlKey(key));
                }
                return this._safeSet(this._prefix(key), encode(val));
            },
            remove: function(key) {
                this.ls.removeItem(this._ttlKey(key));
                this.ls.removeItem(this._prefix(key));
                return this;
            },
            clear: function() {
                var i, keys = gatherMatchingKeys(this.keyMatcher);
                for (i = keys.length; i--; ) {
                    this.remove(keys[i]);
                }
                return this;
            },
            isExpired: function(key) {
                var ttl = decode(this.ls.getItem(this._ttlKey(key)));
                return _.isNumber(ttl) && now() > ttl ? true : false;
            }
        });
        return PersistentStorage;
        function now() {
            return new Date().getTime();
        }
        function encode(val) {
            return JSON.stringify(_.isUndefined(val) ? null : val);
        }
        function decode(val) {
            return JSON.parse(val);
        }
        function gatherMatchingKeys(keyMatcher) {
            var i, key, keys = [], len = LOCAL_STORAGE.length;
            for (i = 0; i < len; i++) {
                if ((key = LOCAL_STORAGE.key(i)).match(keyMatcher)) {
                    keys.push(key.replace(keyMatcher, ""));
                }
            }
            return keys;
        }
    }();
    var Transport = function() {
        "use strict";
        var pendingRequestsCount = 0, pendingRequests = {}, sharedCache = new LruCache(10);
        function Transport(o) {
            o = o || {};
            this.maxPendingRequests = o.maxPendingRequests || 6;
            this.cancelled = false;
            this.lastReq = null;
            this._send = o.transport;
            this._get = o.limiter ? o.limiter(this._get) : this._get;
            this._cache = o.cache === false ? new LruCache(0) : sharedCache;
        }
        Transport.setMaxPendingRequests = function setMaxPendingRequests(num) {
            this.maxPendingRequests = num;
        };
        Transport.resetCache = function resetCache() {
            sharedCache.reset();
        };
        _.mixin(Transport.prototype, {
            _fingerprint: function fingerprint(o) {
                o = o || {};
                return o.url + o.type + _.param(o.data || {});
            },
            _get: function(o, cb) {
                var that = this, fingerprint, jqXhr;
                fingerprint = this._fingerprint(o);
                if (this.cancelled || fingerprint !== this.lastReq) {
                    return;
                }
                if (jqXhr = pendingRequests[fingerprint]) {
                    jqXhr.done(done).fail(fail);
                } else if (pendingRequestsCount < this.maxPendingRequests) {
                    pendingRequestsCount++;
                    pendingRequests[fingerprint] = this._send(o).done(done).fail(fail).always(always);
                } else {
                    this.onDeckRequestArgs = [].slice.call(arguments, 0);
                }
                function done(resp) {
                    cb(null, resp);
                    that._cache.set(fingerprint, resp);
                }
                function fail() {
                    cb(true);
                }
                function always() {
                    pendingRequestsCount--;
                    delete pendingRequests[fingerprint];
                    if (that.onDeckRequestArgs) {
                        that._get.apply(that, that.onDeckRequestArgs);
                        that.onDeckRequestArgs = null;
                    }
                }
            },
            get: function(o, cb) {
                var resp, fingerprint;
                cb = cb || _.noop;
                o = _.isString(o) ? {
                    url: o
                } : o || {};
                fingerprint = this._fingerprint(o);
                this.cancelled = false;
                this.lastReq = fingerprint;
                if (resp = this._cache.get(fingerprint)) {
                    cb(null, resp);
                } else {
                    this._get(o, cb);
                }
            },
            cancel: function() {
                this.cancelled = true;
            }
        });
        return Transport;
    }();
    var SearchIndex = window.SearchIndex = function() {
        "use strict";
        var CHILDREN = "c", IDS = "i";
        function SearchIndex(o) {
            o = o || {};
            if (!o.datumTokenizer || !o.queryTokenizer) {
                throw new Error("datumTokenizer and queryTokenizer are both required");
            }
            this.identify = o.identify || _.stringify;
            this.datumTokenizer = o.datumTokenizer;
            this.queryTokenizer = o.queryTokenizer;
            this.matchAnyQueryToken = o.matchAnyQueryToken;
            this.reset();
        }
        _.mixin(SearchIndex.prototype, {
            bootstrap: function bootstrap(o) {
                this.datums = o.datums;
                this.trie = o.trie;
            },
            add: function(data) {
                var that = this;
                data = _.isArray(data) ? data : [ data ];
                _.each(data, function(datum) {
                    var id, tokens;
                    that.datums[id = that.identify(datum)] = datum;
                    tokens = normalizeTokens(that.datumTokenizer(datum));
                    _.each(tokens, function(token) {
                        var node, chars, ch;
                        node = that.trie;
                        chars = token.split("");
                        while (ch = chars.shift()) {
                            node = node[CHILDREN][ch] || (node[CHILDREN][ch] = newNode());
                            node[IDS].push(id);
                        }
                    });
                });
            },
            get: function get(ids) {
                var that = this;
                return _.map(ids, function(id) {
                    return that.datums[id];
                });
            },
            search: function search(query) {
                var that = this, tokens, matches;
                tokens = normalizeTokens(this.queryTokenizer(query));
                _.each(tokens, function(token) {
                    var node, chars, ch, ids;
                    if (matches && matches.length === 0 && !that.matchAnyQueryToken) {
                        return false;
                    }
                    node = that.trie;
                    chars = token.split("");
                    while (node && (ch = chars.shift())) {
                        node = node[CHILDREN][ch];
                    }
                    if (node && chars.length === 0) {
                        ids = node[IDS].slice(0);
                        matches = matches ? getIntersection(matches, ids) : ids;
                    } else {
                        if (!that.matchAnyQueryToken) {
                            matches = [];
                            return false;
                        }
                    }
                });
                return matches ? _.map(unique(matches), function(id) {
                    return that.datums[id];
                }) : [];
            },
            all: function all() {
                var values = [];
                for (var key in this.datums) {
                    values.push(this.datums[key]);
                }
                return values;
            },
            reset: function reset() {
                this.datums = {};
                this.trie = newNode();
            },
            serialize: function serialize() {
                return {
                    datums: this.datums,
                    trie: this.trie
                };
            }
        });
        return SearchIndex;
        function normalizeTokens(tokens) {
            tokens = _.filter(tokens, function(token) {
                return !!token;
            });
            tokens = _.map(tokens, function(token) {
                return token.toLowerCase();
            });
            return tokens;
        }
        function newNode() {
            var node = {};
            node[IDS] = [];
            node[CHILDREN] = {};
            return node;
        }
        function unique(array) {
            var seen = {}, uniques = [];
            for (var i = 0, len = array.length; i < len; i++) {
                if (!seen[array[i]]) {
                    seen[array[i]] = true;
                    uniques.push(array[i]);
                }
            }
            return uniques;
        }
        function getIntersection(arrayA, arrayB) {
            var ai = 0, bi = 0, intersection = [];
            arrayA = arrayA.sort();
            arrayB = arrayB.sort();
            var lenArrayA = arrayA.length, lenArrayB = arrayB.length;
            while (ai < lenArrayA && bi < lenArrayB) {
                if (arrayA[ai] < arrayB[bi]) {
                    ai++;
                } else if (arrayA[ai] > arrayB[bi]) {
                    bi++;
                } else {
                    intersection.push(arrayA[ai]);
                    ai++;
                    bi++;
                }
            }
            return intersection;
        }
    }();
    var Prefetch = function() {
        "use strict";
        var keys;
        keys = {
            data: "data",
            protocol: "protocol",
            thumbprint: "thumbprint"
        };
        function Prefetch(o) {
            this.url = o.url;
            this.ttl = o.ttl;
            this.cache = o.cache;
            this.prepare = o.prepare;
            this.transform = o.transform;
            this.transport = o.transport;
            this.thumbprint = o.thumbprint;
            this.storage = new PersistentStorage(o.cacheKey);
        }
        _.mixin(Prefetch.prototype, {
            _settings: function settings() {
                return {
                    url: this.url,
                    type: "GET",
                    dataType: "json"
                };
            },
            store: function store(data) {
                if (!this.cache) {
                    return;
                }
                this.storage.set(keys.data, data, this.ttl);
                this.storage.set(keys.protocol, location.protocol, this.ttl);
                this.storage.set(keys.thumbprint, this.thumbprint, this.ttl);
            },
            fromCache: function fromCache() {
                var stored = {}, isExpired;
                if (!this.cache) {
                    return null;
                }
                stored.data = this.storage.get(keys.data);
                stored.protocol = this.storage.get(keys.protocol);
                stored.thumbprint = this.storage.get(keys.thumbprint);
                isExpired = stored.thumbprint !== this.thumbprint || stored.protocol !== location.protocol;
                return stored.data && !isExpired ? stored.data : null;
            },
            fromNetwork: function(cb) {
                var that = this, settings;
                if (!cb) {
                    return;
                }
                settings = this.prepare(this._settings());
                this.transport(settings).fail(onError).done(onResponse);
                function onError() {
                    cb(true);
                }
                function onResponse(resp) {
                    cb(null, that.transform(resp));
                }
            },
            clear: function clear() {
                this.storage.clear();
                return this;
            }
        });
        return Prefetch;
    }();
    var Remote = function() {
        "use strict";
        function Remote(o) {
            this.url = o.url;
            this.prepare = o.prepare;
            this.transform = o.transform;
            this.indexResponse = o.indexResponse;
            this.transport = new Transport({
                cache: o.cache,
                limiter: o.limiter,
                transport: o.transport,
                maxPendingRequests: o.maxPendingRequests
            });
        }
        _.mixin(Remote.prototype, {
            _settings: function settings() {
                return {
                    url: this.url,
                    type: "GET",
                    dataType: "json"
                };
            },
            get: function get(query, cb) {
                var that = this, settings;
                if (!cb) {
                    return;
                }
                query = query || "";
                settings = this.prepare(query, this._settings());
                return this.transport.get(settings, onResponse);
                function onResponse(err, resp) {
                    err ? cb([]) : cb(that.transform(resp));
                }
            },
            cancelLastRequest: function cancelLastRequest() {
                this.transport.cancel();
            }
        });
        return Remote;
    }();
    var oParser = function() {
        "use strict";
        return function parse(o) {
            var defaults, sorter;
            defaults = {
                initialize: true,
                identify: _.stringify,
                datumTokenizer: null,
                queryTokenizer: null,
                matchAnyQueryToken: false,
                sufficient: 5,
                indexRemote: false,
                sorter: null,
                local: [],
                prefetch: null,
                remote: null
            };
            o = _.mixin(defaults, o || {});
            if (!o.datumTokenizer) {
                throw new Error("datumTokenizer is required");
            }
            if (!o.queryTokenizer) {
                throw new Error("queryTokenizer is required");
            }
            sorter = o.sorter;
            o.sorter = sorter ? function(x) {
                return x.sort(sorter);
            } : _.identity;
            o.local = _.isFunction(o.local) ? o.local() : o.local;
            o.prefetch = parsePrefetch(o.prefetch);
            o.remote = parseRemote(o.remote);
            return o;
        };
        function parsePrefetch(o) {
            var defaults;
            if (!o) {
                return null;
            }
            defaults = {
                url: null,
                ttl: 24 * 60 * 60 * 1e3,
                cache: true,
                cacheKey: null,
                thumbprint: "",
                prepare: _.identity,
                transform: _.identity,
                transport: null
            };
            o = _.isString(o) ? {
                url: o
            } : o;
            o = _.mixin(defaults, o);
            if (!o.url) {
                throw new Error("prefetch requires url to be set");
            }
            o.transform = o.filter || o.transform;
            o.cacheKey = o.cacheKey || o.url;
            o.thumbprint = VERSION + o.thumbprint;
            o.transport = o.transport ? callbackToDeferred(o.transport) : _.ajax;
            return o;
        }
        function parseRemote(o) {
            var defaults;
            if (!o) {
                return;
            }
            defaults = {
                url: null,
                cache: true,
                prepare: null,
                replace: null,
                wildcard: null,
                limiter: null,
                rateLimitBy: "debounce",
                rateLimitWait: 300,
                transform: _.identity,
                transport: null
            };
            o = _.isString(o) ? {
                url: o
            } : o;
            o = _.mixin(defaults, o);
            if (!o.url) {
                throw new Error("remote requires url to be set");
            }
            o.transform = o.filter || o.transform;
            o.prepare = toRemotePrepare(o);
            o.limiter = toLimiter(o);
            o.transport = o.transport ? callbackToDeferred(o.transport) : _.ajax;
            delete o.replace;
            delete o.wildcard;
            delete o.rateLimitBy;
            delete o.rateLimitWait;
            return o;
        }
        function toRemotePrepare(o) {
            var prepare, replace, wildcard;
            prepare = o.prepare;
            replace = o.replace;
            wildcard = o.wildcard;
            if (prepare) {
                return prepare;
            }
            if (replace) {
                prepare = prepareByReplace;
            } else if (o.wildcard) {
                prepare = prepareByWildcard;
            } else {
                prepare = identityPrepare;
            }
            return prepare;
            function prepareByReplace(query, settings) {
                settings.url = replace(settings.url, query);
                return settings;
            }
            function prepareByWildcard(query, settings) {
                settings.url = settings.url.replace(wildcard, encodeURIComponent(query));
                return settings;
            }
            function identityPrepare(query, settings) {
                return settings;
            }
        }
        function toLimiter(o) {
            var limiter, method, wait;
            limiter = o.limiter;
            method = o.rateLimitBy;
            wait = o.rateLimitWait;
            if (!limiter) {
                limiter = /^throttle$/i.test(method) ? throttle(wait) : debounce(wait);
            }
            return limiter;
            function debounce(wait) {
                return function debounce(fn) {
                    return _.debounce(fn, wait);
                };
            }
            function throttle(wait) {
                return function throttle(fn) {
                    return _.throttle(fn, wait);
                };
            }
        }
        function callbackToDeferred(fn) {
            return function wrapper(o) {
                var deferred = Deferred();
                fn(o, onSuccess, onError);
                return deferred;
                function onSuccess(resp) {
                    _.defer(function() {
                        deferred.resolve(resp);
                    });
                }
                function onError(err) {
                    _.defer(function() {
                        deferred.reject(err);
                    });
                }
            };
        }
    }();
    var Bloodhound = function() {
        "use strict";
        var old;
        old = window && window.Bloodhound;
        function Bloodhound(o) {
            o = oParser(o);
            this.sorter = o.sorter;
            this.identify = o.identify;
            this.sufficient = o.sufficient;
            this.indexRemote = o.indexRemote;
            this.local = o.local;
            this.remote = o.remote ? new Remote(o.remote) : null;
            this.prefetch = o.prefetch ? new Prefetch(o.prefetch) : null;
            this.index = new SearchIndex({
                identify: this.identify,
                datumTokenizer: o.datumTokenizer,
                queryTokenizer: o.queryTokenizer
            });
            o.initialize !== false && this.initialize();
        }
        Bloodhound.noConflict = function noConflict() {
            window && (window.Bloodhound = old);
            return Bloodhound;
        };
        Bloodhound.tokenizers = tokenizers;
        _.mixin(Bloodhound.prototype, {
            __ttAdapter: function ttAdapter() {
                var that = this;
                return this.remote ? withAsync : withoutAsync;
                function withAsync(query, sync, async) {
                    return that.search(query, sync, async);
                }
                function withoutAsync(query, sync) {
                    return that.search(query, sync);
                }
            },
            _loadPrefetch: function loadPrefetch() {
                var that = this, deferred, serialized;
                deferred = Deferred();
                if (!this.prefetch) {
                    deferred.resolve();
                } else if (serialized = this.prefetch.fromCache()) {
                    this.index.bootstrap(serialized);
                    deferred.resolve();
                } else {
                    this.prefetch.fromNetwork(done);
                }
                return deferred.promise();
                function done(err, data) {
                    if (err) {
                        return deferred.reject();
                    }
                    that.add(data);
                    that.prefetch.store(that.index.serialize());
                    deferred.resolve();
                }
            },
            _initialize: function initialize() {
                var that = this, deferred;
                this.clear();
                (this.initPromise = this._loadPrefetch()).done(addLocalToIndex);
                return this.initPromise;
                function addLocalToIndex() {
                    that.add(that.local);
                }
            },
            initialize: function initialize(force) {
                return !this.initPromise || force ? this._initialize() : this.initPromise;
            },
            add: function add(data) {
                this.index.add(data);
                return this;
            },
            get: function get(ids) {
                ids = _.isArray(ids) ? ids : [].slice.call(arguments);
                return this.index.get(ids);
            },
            search: function search(query, sync, async) {
                var that = this, local;
                sync = sync || _.noop;
                async = async || _.noop;
                local = this.sorter(this.index.search(query));
                sync(this.remote ? local.slice() : local);
                if (this.remote && local.length < this.sufficient) {
                    this.remote.get(query, processRemote);
                } else if (this.remote) {
                    this.remote.cancelLastRequest();
                }
                return this;
                function processRemote(remote) {
                    var nonDuplicates = [];
                    _.each(remote, function(r) {
                        !_.some(local, function(l) {
                            return that.identify(r) === that.identify(l);
                        }) && nonDuplicates.push(r);
                    });
                    that.indexRemote && that.add(nonDuplicates);
                    async(nonDuplicates);
                }
            },
            all: function all() {
                return this.index.all();
            },
            clear: function clear() {
                this.index.reset();
                return this;
            },
            clearPrefetchCache: function clearPrefetchCache() {
                this.prefetch && this.prefetch.clear();
                return this;
            },
            clearRemoteCache: function clearRemoteCache() {
                Transport.resetCache();
                return this;
            },
            ttAdapter: function ttAdapter() {
                return this.__ttAdapter();
            }
        });
        return Bloodhound;
    }();
    return Bloodhound;
});