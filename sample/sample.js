///<reference path="../node.d.ts" />
var Promise = require('../Promise');

function main() {
    var testAsync = Promise.async(function (a, b) {
        console.log('[1]: ' + a);
        yield(Promise.waitAsync(1000));
        console.log('[2]: ' + b);
        return a + ':' + b;
    });

    testAsync("A", 'B').then(function (result) {
        console.log('result: ' + result);
    });

    Promise.spawn(function () {
        console.log('[1]: ' + 'a');
        yield(Promise.waitAsync(1000));
        console.log('[2]: ' + 'b');
    });

    console.log('start');
    Promise.waitAsync(1000).then(function () {
        console.log('[1]');
        return Promise.waitAsync(2000).then(function () {
            throw (new Error("ERROR!"));
            console.log('[2]');
        });
    }).then(function () {
        console.log('[3]');
        return 'hello';
    }).then(function (value) {
        console.log('[' + value.toUpperCase() + ']');
    }).catch(function (error) {
        console.error('error: ' + error);
    });

    Promise.all([
        Promise.waitAsync(1000),
        Promise.waitAsync(2000),
        Promise.waitAsync(1000),
        Promise.waitAsync(1000),
        Promise.waitAsync(1000)
    ]).then(function () {
        console.log('resolved all!');
    });
}
exports.main = main;
