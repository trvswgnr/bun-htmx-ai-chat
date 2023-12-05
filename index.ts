import fs from "node:fs/promises";
import { build, serve } from "./serve";

const buildOutput = await build();
const server = await serve();

async function* combineAsyncIterables<T>(...iterables: AsyncIterable<T>[]): AsyncIterable<T> {
    const iterators = iterables.map((iterable) => iterable[Symbol.asyncIterator]());
    while (true) {
        const result = await Promise.any(iterators.map((iterator) => iterator.next()));
        if (result.done) {
            return;
        }
        yield result.value;
    }
}

const clientWatcher = fs.watch("./client", { recursive: true });
const serverWatcher = fs.watch("./server", { recursive: true });
const events = combineAsyncIterables(clientWatcher, serverWatcher);
for await (const { eventType, filename } of events) {
    const type = eventType.replace(/e$/, "");
    console.log(`${filename} ${type}ed, reloading...`);
    await server.reload();
}
