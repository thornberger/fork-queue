[![Build Status](https://travis-ci.org/thornberger/fork-queue.svg?branch=master)](https://travis-ci.org/thornberger/fork-queue)
# ts-fork-queue
A simple nodejs fork queue with typescript support.

# Installation
NPM:
`npm install ts-fork-queue`
Yarn:
`yarn add ts-fork-queue`

# Usage
```
import {ForkQueue} from "ts-fork-queue";

const queue = new ForkQueue({
    maxQueueSize: 5;
    maxParallelism: 3;
    pollingPeriodSeconds: 2;
});
queue.start();

queue.enqueue({
    getCommand: () => {
        '/path/to/my/module'
    };
    getArgs: () => {
        'foo'
    };
    getCwd(): () => {
        '/home/foo/bar'
    };
    toString: () => 'myCommand';
});
```

If the queue is full, a `QueueFullError` will be thrown when calling `enqueue()`.




