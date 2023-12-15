import { setContext } from "~/server/util";

export async function build() {
    const start = Bun.nanoseconds();
    const outdir = "./public";

    await cleanFolder(outdir);

    const build = await Bun.build({
        entrypoints: ["./client/index.ts"],
        outdir,
        naming: "[dir]/[name].[hash].[ext]",
        sourcemap: "external",
    });

    const currentDir = import.meta.dir; // *note: no trailing slash

    const buildAssetInfos: { path: string; size: number }[] = [];
    for (const output of build.outputs) {
        const path = output.path.replace(currentDir, ".");
        buildAssetInfos.push({ path, size: output.size });
    }
    const buildAssets: Record<string, string[]> = {};
    for (const { path } of buildAssetInfos) {
        const ext = path.split(".").pop()!;
        buildAssets[ext] ??= [];
        buildAssets[ext].push(path);
    }
    setContext("assets", buildAssets);

    const end = Bun.nanoseconds();
    const duration = formatNanoseconds(end - start);
    const longestPath = buildAssetInfos.reduce(
        (a, b) => (a.length > b.path.length ? a : b.path),
        "",
    );
    const longestPathLength = longestPath.length;
    for (const asset of buildAssetInfos) {
        const padding = " ".repeat(longestPathLength - asset.path.length);
        console.log(`${asset.path}${padding}   ${formatBytes(asset.size)}`);
    }
    console.log(
        `${color.gray(`[${duration}]`)} ${color.green("bundle")} ${buildAssetInfos.length} modules`,
    );
    return build;
}

async function cleanFolder(folder: `./${string}`) {
    const { readdir, unlink } = await import("node:fs/promises");
    const files = await readdir(folder);
    for (const file of files) {
        await unlink(`${folder}/${file}`);
    }
}

// returns the largest unit of time that is not 0
function formatNanoseconds(nanoseconds: number) {
    const units = [
        { unit: "day", divisor: 8.64e13 },
        { unit: "hour", divisor: 3.6e12 },
        { unit: "minute", divisor: 6e10 },
        { unit: "second", divisor: 1e9 },
        { unit: "millisecond", divisor: 1e6 },
        { unit: "microsecond", divisor: 1e3 },
        { unit: "nanosecond", divisor: 1 },
    ];

    let value = nanoseconds;
    let finalUnit = "nanosecond";
    for (const { unit, divisor } of units) {
        value = nanoseconds / divisor;
        if (value > 1) {
            finalUnit = unit;
            break;
        }
    }
    const str = Math.round(value).toLocaleString("en-us", {
        unit: finalUnit,
        style: "unit",
        unitDisplay: "narrow",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
        maximumSignificantDigits: 2,
        minimumSignificantDigits: 1,
    });
    return str;
}

function formatBytes(bytes: number) {
    const units = [
        { unit: "gigabyte", divisor: 1e9 },
        { unit: "megabyte", divisor: 1e6 },
        { unit: "kilobyte", divisor: 1e3 },
        { unit: "byte", divisor: 1 },
    ];

    let value = bytes;
    let finalUnit = "byte";
    for (const { unit, divisor } of units) {
        value = bytes / divisor;
        if (value > 1) {
            finalUnit = unit;
            break;
        }
    }
    const str = Math.round(value).toLocaleString("en-us", {
        unit: finalUnit,
        style: "unit",
        unitDisplay: "short",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
        maximumSignificantDigits: 2,
        minimumSignificantDigits: 1,
    });
    return str;
}

const color = {
    green: (text: string) => `\x1b[32m${text}\x1b[0m`,
    red: (text: string) => `\x1b[31m${text}\x1b[0m`,
    gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
};
