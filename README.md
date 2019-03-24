[![Build Status](https://travis-ci.org/thornberger/fork-queue.svg?branch=master)](https://travis-ci.org/thornberger/fork-queue) [![Greenkeeper badge](https://badges.greenkeeper.io/thornberger/fork-queue.svg)](https://greenkeeper.io/)
# ts-fork-queue
A minimalistic nodejs fork queue with typescript support.

# Installation
via npm:
`npm install ts-fork-queue`

via yarn:
`yarn add ts-fork-queue`

# Overview
This library offers a queue of configurable size that contains tasks. Each task keeps all the information for forking the nodejs process and running a specified module.
A scheduler regularly polls the queue to check if tasks can be forked and does so if they can.

The scheduler however does not take care of shutting down tasks. Tasks need to take care of exiting themselves calling `process.exit()`, otherwise processes will only be killed when the root process dies. 

# Usage
Create a new `ForkQueue` object with the desired configuration (see below). Start the scheduler with `queue.start()` and add tasks to be forked  calling `queue.enqueue()`.

```js
import {ForkQueue} from "ts-fork-queue";

const queue = new ForkQueue({
    maxQueueSize: 5,
    maxParallelism: 3,
    pollingPeriodSeconds: 2
});
queue.start();

queue.enqueue({
    getCommand: () => '/path/to/my/module',
    getArgs: () => 'foo',
    getCwd: () => '/home/foo/bar',
    toString: () => 'myCommand'
});
```
Task objects must provide methods to execute a nodejs module.
* `getCommand()`: A path to a nodejs module, relative to current working directory provided with `getCwd()`.
* `getArgs()`: Any arguments provided to the command.
* `getCwd()`: The current working directory.
* `toString()`: A string representation (used for debugging and error output).


Calling `queue.enqueue` will throw a `QueueFullError` if the queue is full.
If an invalid configuration is provided, an `InvalidConfigError` is thrown.

# Configuration
* `maxQueueSize: number`: The maximum size of the queue, i.e. the maximum number of entries that wait to be forked.
* `maxParallelism: number`: The maximum number of tasks that will be executed in parallel. This corresponds to the maximum number of nodejs processes generated.
* `pollingPeriodSeconds: number`: The polling period in seconds (can be a floating point value). The lower this value, the quicker tasks will be checked if they can be scheduled.

# Q&A
Q: Why do I need this library?  
A: You probably don't.

Q: Why does it not emit events when tasks are scheduled, error, etc?  
A: Because when building this library I did not have any use case for that. I might add events if needed in the future.




