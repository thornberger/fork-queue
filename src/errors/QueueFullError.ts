import {ForkQueueTask} from "../ForkQueueTask";

export class QueueFullError extends Error {
    constructor(task: ForkQueueTask, maxQueueSize: number) {
        super(`Unable to queue Task ${task.toString()}. Maximum ${maxQueueSize} tasks can be queued at a time.`);
    }
}
