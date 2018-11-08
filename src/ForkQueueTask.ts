export interface ForkQueueTask {
    getCommand(): string;
    getArgs(): string[];
    getCwd(): string;
    toString(): string;
}
