///<reference path="../node.d.ts" />

import Promise = require('../Promise');
Promise.rewriteFolderSync(__dirname);

import sample = require('./sample');
sample.main();