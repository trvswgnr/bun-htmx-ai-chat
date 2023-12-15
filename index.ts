import fs from "node:fs/promises";
import "~/global.shared";
import { exec as execSync } from "node:child_process";
function buildAndServe() {
    const child = execSync("bun run serve.ts");
    child.addListener("error", (err) => {
        console.error(err);
    });
    child.stdout?.addListener("data", (data) => {
        process.stdout.write(data);
    });
    child.stderr?.addListener("data", (data) => {
        process.stderr.write(data);
    });
    return child;
}

let child = buildAndServe();

const clientWatcher = fs.watch("./client", { recursive: true });
const serverWatcher = fs.watch("./server", { recursive: true });
const events = chain(clientWatcher, serverWatcher);
for await (const { eventType, filename } of events) {
    const type = eventType.replace(/e$/, "");
    console.log(`${filename} ${type}ed, reloading...`);
    child.kill();
    child = buildAndServe();
}
