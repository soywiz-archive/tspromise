///<reference path="./node.d.ts" />
var fs = require('fs');

var Promise = (function () {
    function Promise(callback) {
        var _this = this;
        this.__isCompleted = false;
        this.__call = null;
        this.__result = null;
        this.__callbacks = [];
        var resolve = function (value) {
            if (_this.__isCompleted)
                return;
            _this.__isCompleted = true;
            _this.__call = 'onFulfilled';
            _this.__result = value;
            _this.__executeCallbacks();
        };

        var reject = function (error) {
            if (_this.__isCompleted)
                return;
            _this.__isCompleted = true;
            _this.__call = 'onRejected';
            _this.__result = error;
            _this.__executeCallbacks();
        };

        try  {
            callback(resolve, reject);
        } catch (e) {
            reject(e);
        }
    }
    Promise.prototype.__executeCallbacks = function () {
        var _this = this;
        if (!this.__isCompleted)
            return;
        if (this.__callbacks.length == 0)
            return;
        setImmediate(function () {
            while (_this.__callbacks.length > 0) {
                var callback = _this.__callbacks.shift();
                callback[_this.__call](_this.__result);
            }
        });
    };

    Promise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.__callbacks.push({
                onFulfilled: function (value) {
                    if (!onFulfilled) {
                        resolve(value);
                        return;
                    }

                    try  {
                        var result = onFulfilled(value);
                        if (Promise.isThenable(result)) {
                            result.then(resolve, reject);
                        } else {
                            resolve(result);
                        }
                    } catch (e) {
                        reject(e);
                    }
                }, onRejected: function (error) {
                    if (onRejected) {
                        try  {
                            resolve(onRejected(error));
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(error);
                    }
                }
            });
            _this.__executeCallbacks();
        });
    };

    Promise.prototype.catch = function (onRejected) {
        return this.then(undefined, onRejected);
    };

    Promise.isThenable = function (value) {
        return value && (typeof value.then === 'function');
    };

    Promise.resolve = function (value) {
        if (value instanceof Promise)
            return value;

        return new Promise(function (resolve, reject) {
            if (Promise.isThenable(value)) {
                value.then(resolve, reject);
            } else {
                resolve(value);
            }
        });
    };

    Promise.reject = function (error) {
        return new Promise(function (resolve, reject) {
            reject(error);
        });
    };

    Promise.all = function (promises) {
        if (!promises.forEach)
            return Promise.resolve();

        return new Promise(function (resolve, reject) {
            var resolvedPromises = 0;
            var totalPromises = promises.length;
            var results = new Array(totalPromises);
            promises.forEach(function (promise, index) {
                promise.then(function (result) {
                    results[index] = result;
                    resolvedPromises++;
                    if (resolvedPromises == totalPromises) {
                        resolve(results);
                    }
                }, function (error) {
                    reject(error);
                });
            });
        });
    };

    Promise.async = function (callback) {
        return function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return Promise._spawn(callback, args);
        };
    };

    Promise.spawn = function (generatorFunction) {
        return Promise._spawn(generatorFunction, []);
    };

    Promise._spawn = function (generatorFunction, args) {
        var first = true;
        return new Promise(function (resolve, reject) {
            try  {
                var iterator = generatorFunction.apply(null, args);
            } catch (e) {
                reject(e);
            }

            var next = function (first, sendValue, sendException) {
                try  {
                    var result;
                    if (first) {
                        result = iterator.next();
                    } else if (sendException) {
                        result = iterator.throw(sendException);
                    } else {
                        result = iterator.next(sendValue);
                    }

                    if (result.done) {
                        return resolve(result.value);
                    } else if (result.value.then === undefined) {
                        return reject(new Error("Invalid result: '" + result.value + "'"));
                    } else {
                        result.value.then((function (value) {
                            return next(false, value, undefined);
                        }), (function (error) {
                            return next(false, undefined, error);
                        }));
                    }
                } catch (e) {
                    return reject(e);
                }

                return undefined;
            };

            next(true, undefined, undefined);
        });
    };

    Promise.rewriteFolderSync = function (path) {
        fs.readdirSync(path).forEach(function (fileName) {
            var fullPath = path + '/' + fileName;
            if (fileName == 'node_modules')
                return;
            if (fileName.match(/\.js$/)) {
                var data = (fs.readFileSync(fullPath, 'utf-8'));
                var datamod = data;
                datamod = datamod.replace(/Promise.async\s*\(\s*function\s*\(/g, 'Promise.async(function*(');
                datamod = datamod.replace(/Promise.spawn\s*\(\s*function\s*\(/g, 'Promise.spawn(function*(');
                if (data != datamod) {
                    fs.writeFileSync(fullPath, datamod, 'utf-8');
                    console.log('Fixed generators in "' + fullPath + '"');
                }
            }
            if (fs.lstatSync(fullPath).isDirectory()) {
                Promise.rewriteFolderSync(fullPath);
            }
        });
    };

    Promise.waitAsync = function (time) {
        return new Promise(function (resolve, reject) {
            setTimeout(resolve, time);
        });
    };

    Promise.nfcall = function (obj, methodName) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 2); _i++) {
            args[_i] = arguments[_i + 2];
        }
        return new Promise(function (resolve, reject) {
            function callback(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
            args.push(callback);
            obj[methodName].apply(obj, args);
        });
    };
    return Promise;
})();

module.exports = Promise;
