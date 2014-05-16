/// <reference path="node.d.ts" />

interface Thenable<T> {
	then<TR>(onFulfilled: (value: T) => Thenable<TR>, onRejected?: (error: Error) => TR): Thenable<TR>;
	then<TR>(onFulfilled: (value: T) => Thenable<TR>, onRejected?: (error: Error) => void): Thenable<TR>;
	then<TR>(onFulfilled: (value: T) => TR, onRejected?: (error: Error) => void): Thenable<TR>;
	catch(rejected?: (error: Error) => void): Promise<T>;
	catch<Q>(rejected?: (error: Error) => Q): Promise<Q>;
	catch<Q>(rejected?: (error: Error) => Promise<Q>): Promise<Q>;
}

declare module "tspromise" {
	class Promise<T> implements Thenable<T> {
		constructor(callback: (resolve?: (value: T) => void, reject?: (error: Error) => void) => void);
		public then<TR>(onFulfilled: (value: T) => Promise<TR>, onRejected?: (error: Error) => TR): Promise<TR>;
		public then<TR>(onFulfilled: (value: T) => Promise<TR>, onRejected?: (error: Error) => void): Promise<TR>;
		public then<TR>(onFulfilled: (value: T) => TR, onRejected?: (error: Error) => void): Promise<TR>;
		public catch(rejected?: (error: Error) => void): Promise<T>;
		public catch<Q>(rejected?: (error: Error) => Promise<Q>): Promise<Q>;
		public catch<Q>(rejected?: (error: Error) => Q): Promise<Q>;
		static resolve<T>(promise: Promise<T>): Promise<T>;
		static resolve<T>(value?: T): Promise<T>;
		static reject<T>(error: Error): Promise<T>;
		static all<T>(promises: Promise<T>[]): Promise<{}>;
		static async<TR>(callback: () => TR): () => Promise<TR>;
		static async<T1, TR>(callback: (p1: T1) => TR): (p1: T1) => Promise<TR>;
		static async<T1, T2, TR>(callback: (p1: T1, p2: T2) => TR): (p1: T1, p2: T2) => Promise<TR>;
		static async<T1, T2, T3, TR>(callback: (p1: T1, p2: T2, p3: T3) => TR): (p1: T1, p2: T2, p3: T3) => Promise<TR>;
		static async<T1, T2, T3, T4, TR>(callback: (p1: T1, p2: T2, p3: T3, p4: T4) => TR): (p1: T1, p2: T2, p3: T3, p4: T4) => Promise<TR>;
		static spawn<TR>(generatorFunction: () => TR): Promise<TR>;
		static rewriteFolderSync(path: string): void;
		static waitAsync(time: number): Promise<{}>;
		static nfcall<T>(obj: any, methodName: String, ...args: any[]): Thenable<T>;
	}
	
	export = Promise;
}

declare function yield<T>(promise: Thenable<T>): T;
