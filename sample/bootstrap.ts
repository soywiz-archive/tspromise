declare var __dirname:string;

import Promise = require('../Promise');
Promise.rewriteFolderSync(__dirname);

import sample = require('./sample');
sample.main();