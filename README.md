tspromise
=========

Installing with npm:

```
npm install tspromise
```

Using promises with typescript:

bootstrap.ts
```ts
///<reference path="node.d.ts" />

import Promise = require('tspromise');
Promise.rewriteFolderSync(__dirname);

import sample = require('./main');
sample.main();
```

main.ts
```ts
import Promise = require('tspromise');

function waitAsync(time: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

var test1Async = Promise.async((a, b) => {
  console.log('[1]: ' + a);
  yield(Promise.waitAsync(1000));
  console.log('[2]: ' + b);
  return a + ':' + n;
});

export function main() {
  test1Async('A', 'B').then((result) => {
    console.log(result);
    return Promise.waitAsync(1000).then(() => {
      console.log('hello world!');
    });
  });
}
```

```ts
// Simplified definition
module tspromise {
  declare class Promise<T> {
      constructor(callback: (resolve: (value: T) => void, reject?: (error: Error) => void) => void);
      
      // Thenable interface + catch
      public then<TR>(onFulfilled: (value: T) => Promise<TR>, onRejected?: (error: Error) => TR): Promise<TR>;
      public then<TR>(onFulfilled: (value: T) => TR, onRejected?: (error: Error) => void): Promise<TR>;
      public catch(onRejected: (error: Error) => T): Promise<T>;

      // Create completed promises      
      static resolve<T>(value?: T): Promise<T>;
      static resolve<T>(promise: Promise<T>): Promise<T>;
      static reject<T>(error: Error): Promise<T>;
      static all<T>(promises: Promise<T>[]): Promise<{}>;

      // Generators
      static async<TR>(callback: () => TR): () => Promise<TR>;
      static spawn<TR>(generatorFunction: () => TR): Promise<TR>;
      static rewriteFolderSync(path: string): void;

      // Simple utility (setTimeout)      
      static waitAsync(time: number): Promise<{}>;
  }
}

declare function yield<T>(promise: Promise<T>): T;
```
