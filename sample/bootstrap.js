///<reference path="../node.d.ts" />
var Promise = require('../Promise');
Promise.rewriteFolderSync(__dirname);

var sample = require('./sample');
sample.main();
