import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

export default {
    external: [
        ...Object.keys(pkg.dependencies || {}),
    ],
    input: "src/index.ts",
    output: [
        {
            file: pkg.main,
            format: "cjs",
        },
        {
            file: pkg.module,
            format: "es",
        },
    ],
    plugins: [
        typescript({
            typescript: require("typescript"),
        }),
    ],
};
