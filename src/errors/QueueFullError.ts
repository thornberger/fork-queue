import {ForkQueueTask} from "../ForkQueueTask";

export class QueueFullError extends Error {
    constructor(task: ForkQueueTask, maxQueueSize: number) {
        const message = `Unable to queue Task ${task.toString()}. ` +
            `Maximum ${maxQueueSize} tasks can be queued at a time.`;
        /* istanbul ignore next */
        super(message);
    }
}
