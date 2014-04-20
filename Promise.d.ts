/// <reference path="node.d.ts" />
declare class Promise<T> {
    private __isCompleted;
    private __call;
    private __result;
    private __callbacks;
    constructor(callback: (resolve: (value: T) => void, reject?: (error: Error) => void) => void);
    private __executeCallbacks();
    public then<TR>(onFulfilled: (value: T) => Promise<TR>, onRejected?: (error: Error) => TR): Promise<TR>;
    public then<TR>(onFulfilled: (value: T) => Promise<TR>, onRejected?: (error: Error) => void): Promise<TR>;
    public then<TR>(onFulfilled: (value: T) => TR, onRejected?: (error: Error) => void): Promise<TR>;
    public catch(onRejected: (error: Error) => T): Promise<T>;
    private static isThenable(value);
    static resolve<T>(value?: T): Promise<T>;
    static resolve<T>(promise: Promise<T>): Promise<T>;
    static reject<T>(error: Error): Promise<T>;
    static all<T>(promises: Promise<T>[]): Promise<{}>;
    static async<TR>(callback: () => TR): () => Promise<TR>;
    static async<T1, TR>(callback: (p1: T1) => TR): (p1: T1) => Promise<TR>;
    static async<T1, T2, TR>(callback: (p1: T1, p2: T2) => TR): (p1: T1, p2: T2) => Promise<TR>;
    static async<T1, T2, T3, TR>(callback: (p1: T1, p2: T2, p3: T3) => TR): (p1: T1, p2: T2, p3: T3) => Promise<TR>;
    static async<T1, T2, T3, T4, TR>(callback: (p1: T1, p2: T2, p3: T3, p4: T4) => TR): (p1: T1, p2: T2, p3: T3, p4: T4) => Promise<TR>;
    static spawn<TR>(generatorFunction: () => TR): Promise<TR>;
    private static _spawn<TR>(generatorFunction, args);
    static rewriteFolderSync(path: string): void;
    static waitAsync(time: number): Promise<{}>;
}
export = Promise;
