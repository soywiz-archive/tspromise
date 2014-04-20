///<reference path="./node.d.ts" />

import fs = require('fs');
import util = require('util');

interface GeneratorResult {
	value: any;
	done: Boolean;
}

interface Generator {
	next(value?: any): GeneratorResult;
	throw(error: Error): GeneratorResult;
	//send(value: any): GeneratorResult;
}

class Promise<T> {
	private __isCompleted: boolean = false;
	private __call: string = null;
	private __result: any = null;
	private __callbacks: { onFulfilled: Function; onRejected:Function}[] = [];

	constructor(callback: (resolve: (value: T) => void, reject?: (error: Error) => void) => void) {
		var resolve = (value: T) => {
			if (this.__isCompleted) return;
			this.__isCompleted = true;
			this.__call = 'onFulfilled';
			this.__result = value;
			this.__executeCallbacks();
		};

		var reject = (error: Error) => {
			if (this.__isCompleted) return;
			this.__isCompleted = true;
			this.__call = 'onRejected';
			this.__result = error;
			this.__executeCallbacks();
		};

		callback(resolve, reject);
	}

	private __executeCallbacks() {
		if (!this.__isCompleted) return;

		while (this.__callbacks.length > 0) {
			var callback = this.__callbacks.shift();
			callback[this.__call](this.__result);
		}
	}

	then<TR>(onFulfilled: (value: T) => Promise<TR>, onRejected?: (error: Error) => TR): Promise<TR>;
	then<TR>(onFulfilled: (value: T) => Promise<TR>, onRejected?: (error: Error) => void): Promise<TR>;
	then<TR>(onFulfilled: (value: T) => TR, onRejected?: (error: Error) => void): Promise<TR>;
	then<TR>(onFulfilled: (value: T) => TR, onRejected?: (error: Error) => TR): Promise<TR> {
		return new Promise<TR>((resolve, reject) => {
			this.__callbacks.push({
				onFulfilled: (value: T) => {
					if (!onFulfilled) { resolve(<any>value); return; }

					try {
						var result = onFulfilled(value);
						if (Promise.isThenable(result)) {
							(<any>result).then(resolve, reject);
						} else {
							resolve(result);
						}
					} catch (e) {
						reject(e);
					}
				}, onRejected: (error: Error) => {
					if (onRejected) {
						try {
							resolve(onRejected(error));
						} catch (e) {
							reject(e);
						}
					} else {
						reject(error);
					}
				}
			});
			this.__executeCallbacks();
		});
	}

	catch(onRejected: (error: Error) => T) {
		return this.then(<any>undefined, onRejected);
	}

	private static isThenable(value: any) {
		return value && (typeof value.then === 'function');
	}

	static resolve<T>(value?: T): Promise<T>;
	static resolve<T>(promise: Promise<T>): Promise<T>;
	static resolve<T>(value: any): Promise<T> {
		if (value instanceof Promise) return value;

		return new Promise<T>((resolve, reject) => {
			if (Promise.isThenable(value)) {
				value.then(resolve, reject);
			} else {
				resolve(value);
			}
		});
	}

	static reject<T>(error: Error): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			reject(error);
		});
	}

	static all<T>(promises: Promise<T>[]) {
		if (!promises.forEach) return Promise.resolve();

		return new Promise<T[]>((resolve, reject) => {
			var resolvedPromises = 0;
			var totalPromises = promises.length;
			var results: T[] = new Array(totalPromises);
			promises.forEach((promise, index) => {
				promise.then((result: T) => {
					results[index] = result;
					resolvedPromises++;
					if (resolvedPromises == totalPromises) {
						resolve(results);
					}
				}, (error: Error) => {
					reject(error);
				});
			});
		});
	}

	static async<TR>(callback: () => TR): () => Promise<TR>;
	static async<T1, TR>(callback: (p1: T1) => TR): (p1: T1) => Promise<TR>;
	static async<T1, T2, TR>(callback: (p1: T1, p2: T2) => TR): (p1: T1, p2: T2) => Promise<TR>;
	static async<T1, T2, T3, TR>(callback: (p1: T1, p2: T2, p3: T3) => TR): (p1: T1, p2: T2, p3: T3) => Promise<TR>;
	static async<T1, T2, T3, T4, TR>(callback: (p1: T1, p2: T2, p3: T3, p4: T4) => TR): (p1: T1, p2: T2, p3: T3, p4: T4) => Promise<TR>;
	static async<T>(callback: Function): () => Promise<T> {
		return (...args: any[]) => {
			return Promise._spawn(<any>callback, args);
		};
	}

	public static spawn<TR>(generatorFunction: () => TR): Promise<TR> {
		return Promise._spawn(generatorFunction, []);
	}

	private static _spawn<TR>(generatorFunction: () => TR, args: any[]): Promise<TR> {
		var first = true;
		return new Promise((resolve, reject) => {
			try {
				var iterator = <Generator><any>generatorFunction.apply(null, args);
			} catch (e) {
				reject(e);
			}

			var next = (first, sendValue, sendException) => {
				try {
					var result: GeneratorResult;
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
						result.value.then(((value) => next(false, value, undefined)), ((error) => next(false, undefined, error)));
					}
				} catch (e) {
					return reject(e);
				}

				return undefined;
			};

			next(true, undefined, undefined);
		});
	}

	static rewriteFolderSync(path: string) {
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
	}

	static waitAsync(time: number) {
		return new Promise((resolve, reject) => {
			setTimeout(resolve, time);
		});
	}
}

declare function yield<T>(promise: Promise<T>): T;

export = Promise;
