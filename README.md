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

