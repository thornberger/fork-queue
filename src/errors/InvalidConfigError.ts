import {ForkQueueConfig} from "../ForkQueueConfig";

export class InvalidConfigError extends Error {
    constructor(message: string, config: ForkQueueConfig) {
        message += ` Config: maxQueueSize = ${config.maxQueueSize}, ` +
            `maxParallelism = ${config.maxParallelism}, ` +
            `pollingPeriodSeconds = ${config.pollingPeriodSeconds}`;
        /* istanbul ignore next */
        super(message);
    }
}
