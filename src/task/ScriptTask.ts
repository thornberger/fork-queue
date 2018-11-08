import {TaskInterface} from "./TaskInterface";

export class ScriptTask implements TaskInterface {

    private static readonly COMMAND = "dist/cli.js";

    private script: string;
    private scriptArguments: string[] | undefined;

    public constructor(script: string, scriptArguments?: string[]) {
        this.script = script;
        this.scriptArguments = scriptArguments;
    }

    public getCommand(): string {
        return ScriptTask.COMMAND;
    }

    public getArgs(): string[] {
        let args = [this.script];

        if (this.scriptArguments) {
            args = args.concat(this.scriptArguments);
        }

        return args;
    }

    public getCwd(): string {
        return __dirname + "/../../../../";
    }

    public toString(): string {
        return this.getCommand() + " " + this.getArgs();
    }

}
