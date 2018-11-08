import {ChildProcess, fork} from "child_process";
import {InvalidConfigError} from "./errors/InvalidConfigError";
import {QueueFullError} from "./errors/QueueFullError";
import {ForkQueue} from "./ForkQueue";
import {ForkQueueConfig} from "./ForkQueueConfig";
import {TaskInterface} from "./task/TaskInterface";

interface MockChildProcess {
    mock: Partial<ChildProcess>;
    registeredCallbacks: {
        [event: string]: ((...args: any[]) => void) | undefined,
    };
}

jest.mock("child_process", () => {
    return {
        fork: jest.fn(),
    };
});

describe("ForkQueue", () => {

    const config: ForkQueueConfig = {
        maxParallelism: 2,
        maxQueueSize: 4,
        pollingPeriodSeconds: 1,
    };
    const task: TaskInterface = {
        getArgs: () => [],
        getCommand: () => "cmd",
        getCwd: () => "cwd",
        toString: () => "asString",
    };

    const mockChildProcesses: { [pid: number]: MockChildProcess } = {};

    const createMockChildProcess = (pid: number) => {
        mockChildProcesses[pid] = {
            mock: {
                on: (event: string, listener: ((...args: any[]) => void)): ChildProcess => {
                    mockChildProcesses[pid].registeredCallbacks[event] = listener;
                    return (mockChildProcesses[pid].mock as ChildProcess);
                },
                pid,
            },
            registeredCallbacks: {
                error: undefined,
                exit: undefined,
            },
        };
    };

    createMockChildProcess(1);
    createMockChildProcess(2);
    createMockChildProcess(3);
    createMockChildProcess(4);

    let queue: ForkQueue;

    jest.mock("child_process");
    jest.useFakeTimers();

    beforeEach(() => {
        (fork as jest.Mock).mockReset();
        queue = new ForkQueue(config);
    });

    it("throws error when max queue size non-positive number", () => {
        const invalidConfig: ForkQueueConfig = {
            maxParallelism: 1,
            maxQueueSize: -1,
            pollingPeriodSeconds: 2,
        };
        const expectedError = new InvalidConfigError("Maximum queue size has to be a positive number.", invalidConfig);

        expect(() => {
            const invalidQueue = new ForkQueue(invalidConfig);
            invalidQueue.start();
        }).toThrow(expectedError);
    });

    it("throws error when max parallelism non-positive number", () => {
        const invalidConfig: ForkQueueConfig = {
            maxParallelism: -1,
            maxQueueSize: 1,
            pollingPeriodSeconds: 2,
        };
        const expectedError = new InvalidConfigError("Maximum parallelism has to be a positive number.", invalidConfig);

        expect(() => {
            const invalidQueue = new ForkQueue(invalidConfig);
            invalidQueue.start();
        }).toThrow(expectedError);
    });

    it("throws error when period seconds non-positive number", () => {
        const invalidConfig: ForkQueueConfig = {
            maxParallelism: 1,
            maxQueueSize: 1,
            pollingPeriodSeconds: -2,
        };
        const expectedError = new InvalidConfigError("Polling period has to be a positive number.", invalidConfig);

        expect(() => {
            const invalidQueue = new ForkQueue(invalidConfig);
            invalidQueue.start();
        }).toThrow(expectedError);
    });

    it("schedules no task when the queue is empty", () => {
        (fork as jest.Mock).mockReturnValueOnce(mockChildProcesses[1].mock);
        queue.start();

        expect(fork as jest.Mock).not.toBeCalled();
    });

    it("schedules task immediately", () => {
        queue.enqueue(task);
        (fork as jest.Mock).mockReturnValueOnce(mockChildProcesses[1].mock);
        queue.start();

        expect(fork as jest.Mock).toBeCalledTimes(1);
    });

    it("schedules task after one one round of waiting", () => {
        queue.start();
        (fork as jest.Mock).mockReturnValueOnce(mockChildProcesses[1].mock);

        expect(fork as jest.Mock).not.toBeCalled();

        queue.enqueue(task);

        jest.runOnlyPendingTimers();
        jest.runOnlyPendingTimers();

        expect(fork as jest.Mock).toBeCalledTimes(1);
    });

    it("schedules maximum number of tasks", () => {
        (fork as jest.Mock).mockReturnValueOnce(mockChildProcesses[1].mock)
            .mockReturnValueOnce(mockChildProcesses[2].mock)
            .mockReturnValueOnce(mockChildProcesses[3].mock)
            .mockReturnValueOnce(mockChildProcesses[4].mock);

        queue.enqueue(task);
        queue.enqueue(task);
        queue.enqueue(task);
        queue.enqueue(task);

        queue.start();

        jest.runOnlyPendingTimers();
        jest.runOnlyPendingTimers();
        jest.runOnlyPendingTimers();
        jest.runOnlyPendingTimers();
        jest.runOnlyPendingTimers();
        jest.runOnlyPendingTimers();

        expect(fork as jest.Mock).toBeCalledTimes(2);
    });

    it("schedules more tasks when tasks are errored", () => {
        (fork as jest.Mock).mockReturnValueOnce(mockChildProcesses[1].mock)
            .mockReturnValueOnce(mockChildProcesses[2].mock)
            .mockReturnValueOnce(mockChildProcesses[3].mock)
            .mockReturnValueOnce(mockChildProcesses[4].mock);
        queue.enqueue(task);
        queue.enqueue(task);
        queue.enqueue(task);
        queue.enqueue(task);

        queue.start();

        jest.runOnlyPendingTimers();
        jest.runOnlyPendingTimers();

        mockChildProcesses[1].registeredCallbacks.error!();
        mockChildProcesses[2].registeredCallbacks.error!();

        jest.runOnlyPendingTimers();
        jest.runOnlyPendingTimers();

        expect(fork as jest.Mock).toBeCalledTimes(4);
    });

    it("schedules more tasks when tasks are exited", () => {
        (fork as jest.Mock).mockReturnValueOnce(mockChildProcesses[1].mock)
            .mockReturnValueOnce(mockChildProcesses[2].mock)
            .mockReturnValueOnce(mockChildProcesses[3].mock)
            .mockReturnValueOnce(mockChildProcesses[4].mock);
        queue.enqueue(task);
        queue.enqueue(task);
        queue.enqueue(task);
        queue.enqueue(task);

        queue.start();

        jest.runOnlyPendingTimers();
        jest.runOnlyPendingTimers();

        mockChildProcesses[1].registeredCallbacks.exit!();
        mockChildProcesses[2].registeredCallbacks.exit!();

        jest.runOnlyPendingTimers();
        jest.runOnlyPendingTimers();

        expect(fork as jest.Mock).toBeCalledTimes(4);
    });

    it("throws error when trying to enqueue more than max tasks", () => {
        queue.enqueue(task);
        queue.enqueue(task);
        queue.enqueue(task);
        queue.enqueue(task);

        expect(() => {
            queue.enqueue(task);
        }).toThrow(QueueFullError);
    });
});
