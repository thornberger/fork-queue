export interface TaskInterface {
    getCommand(): string;
    getArgs(): string[];
    getCwd(): string;
    toString(): string;
}
