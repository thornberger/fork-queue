import {TaskInterface} from "../task/TaskInterface";
import {ForkQueueError} from "./ForkQueueError";

export class QueueFullError extends ForkQueueError {
    constructor(task: TaskInterface, maxQueueSize: number) {
        super(`Unable to queue Task ${task.toString()}. Maximum ${maxQueueSize} tasks can be queued at a time.`);
    }
}
