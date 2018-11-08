import {ForkQueueConfig} from "../ForkQueueConfig";
import {ForkQueueError} from "./ForkQueueError";

export class InvalidConfigError extends ForkQueueError {
    constructor(message: string, config: ForkQueueConfig) {
        message += ` Config: maxQueueSize = ${config.maxQueueSize}, ` +
            `maxParallelism = ${config.maxParallelism}, ` +
            `pollingPeriodSeconds = ${config.pollingPeriodSeconds}`;

        super(message);
    }
}
