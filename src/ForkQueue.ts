import {fork, ForkOptions} from "child_process";
import {InvalidConfigError} from "./errors/InvalidConfigError";
import {QueueFullError} from "./errors/QueueFullError";
import {ForkQueueConfig} from "./ForkQueueConfig";
import {ForkQueueTask} from "./ForkQueueTask";

export class ForkQueue {
    private readonly config: ForkQueueConfig;
    private queuedTasks: ForkQueueTask[] = [];
    private runningTasks: { [pid: number]: ForkQueueTask; } = [];

    public constructor(config: ForkQueueConfig) {
        this.config = config;

        this.validateConfig();

        this.start = this.start.bind(this);
        this.canScheduleTask = this.canScheduleTask.bind(this);
        this.scheduleTask = this.scheduleTask.bind(this);
        this.enqueue = this.enqueue.bind(this);
        this.clearTask = this.clearTask.bind(this);
        this.getOptions = this.getOptions.bind(this);
    }

    public start(): void {
        if (this.canScheduleTask()) {
            this.scheduleTask();
        }

        setTimeout(this.start, this.config.pollingPeriodSeconds * 1000);
    }

    public enqueue(task: ForkQueueTask): void {
        if (this.queuedTasks.length === this.config.maxQueueSize) {
            throw new QueueFullError(task, this.config.maxQueueSize);
        }

        this.queuedTasks.push(task);
    }

    private validateConfig(): void {
        if (this.config.maxQueueSize <= 0) {
            throw new InvalidConfigError("Maximum queue size has to be a positive number.", this.config);
        }
        if (this.config.maxParallelism <= 0) {
            throw new InvalidConfigError("Maximum parallelism has to be a positive number.", this.config);
        }
        if (this.config.pollingPeriodSeconds <= 0) {
            throw new InvalidConfigError("Polling period has to be a positive number.", this.config);
        }
    }

    private canScheduleTask(): boolean {
        return this.queuedTasks.length > 0 &&
            Object.keys(this.runningTasks).length < this.config.maxParallelism;
    }

    private scheduleTask(): void {
        const task = this.queuedTasks.shift()!;
        const process = fork(task.getCommand(), task.getArgs(), this.getOptions(task));
        this.runningTasks[process.pid] = task;

        process.on("error", () => {
            this.clearTask(process.pid);
        });
        process.on("exit", () => {
            this.clearTask(process.pid);
        });
    }

    private clearTask(pid: number): void {
        delete this.runningTasks[pid];
    }

    private getOptions(task: ForkQueueTask): ForkOptions {
        return {
            cwd: task.getCwd(),
        };
    }

}
