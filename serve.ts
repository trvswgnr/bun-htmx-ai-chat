import { renderToReadableStream, renderToStaticMarkup } from "react-dom/server";
import OpenAI from "openai";
const openai = new OpenAI();
import { App, ChatMain, ChatMessages, Message } from "./server/chat-ui.tsx";
import _messages from "~/db/messages.json";
import { Serve } from "bun";

enum Method {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

globalThis.context = {
    messages: _messages as MessageParam[],
    assets: {},
};

const messages = globalThis.context.messages;

async function addMessage(message: OpenAI.Chat.Completions.ChatCompletionMessageParam) {
    messages.push(message);
    const file = Bun.file("./db/messages.json");
    const writer = file.writer();
    writer.write(JSON.stringify(messages));
    writer.end();
}

async function clearChat() {
    messages.length = 1;
    const file = Bun.file("./db/messages.json");
    const writer = file.writer();
    writer.write(JSON.stringify(messages));
    writer.end();
}

const messageQueue: string[] = [];

export async function serve() {
    const options: Serve = {
        port: 3000,
        async fetch(req) {
            const url = new URL(req.url);
            const path = url.pathname;
            if (path === "/test") {
                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: "You output historical documents." },
                        {
                            role: "user",
                            content:
                                "Recite the first 5 sentences of the declaration of independence.",
                        },
                    ],
                    model: "gpt-3.5-turbo",
                    stream: true,
                });
                const stream = completion.toReadableStream();
                // transform each message to html so we can stream it
                const transformer = new TransformStream({
                    transform(chunk, controller) {
                        const textDecoder = new TextDecoder();
                        const json = textDecoder.decode(chunk);
                        const data: OpenAI.ChatCompletionChunk = JSON.parse(json);
                        const choice = data.choices.nth(0);
                        if (choice === null || choice.finish_reason === "stop") {
                            controller.terminate();
                            return;
                        }
                        const message = choice.delta.content ?? "";
                        controller.enqueue(message);
                    },
                });
                const readable = stream.pipeThrough(transformer);
                // wrap it all in a div
                const wrapper = new ReadableStream({
                    async pull(controller) {
                        controller.enqueue("<div class='chattyboi'>\n");
                        for await (const chunk of readable) {
                            controller.enqueue(chunk);
                        }
                        controller.enqueue("\n</div>");
                        controller.close();
                    },
                });
                return new Response(wrapper, {
                    headers: {
                        "Content-Type": "text/html",
                    },
                });
            }
            if (path.startsWith("/public")) {
                const file = Bun.file(`./${url.pathname}`);
                if (!file.exists()) {
                    return new Response("Not found", { status: 404 });
                }
                return new Response(file, {
                    headers: {
                        "Content-Type": file.type,
                    },
                });
            }

            if (path === "/" && req.method === Method.GET) {
                const html = await renderToReadableStream(App());
                return new Response(html, {
                    headers: {
                        "Content-Type": "text/html",
                    },
                });
            }

            if (path === "/clear" && req.method === Method.POST) {
                console.log("clearing chat");
                const res = await clearChat()
                    .then(async () => {
                        console.log("messages", messages);
                        const html = await renderToReadableStream(ChatMessages());
                        return new Response(html, {
                            headers: {
                                "Content-Type": "text/html",
                            },
                            status: 200,
                        });
                    })
                    .catch((err) => {
                        console.error(err);
                        return new Response("Internal Server Error", { status: 500 });
                    });
                return res;
            }

            if (path === "/message") {
                const message = messageQueue.shift() || "";
                const textDecoder = new TextDecoder();
                const stream = new ReadableStream({
                    type: "direct",
                    async pull(controller) {
                        if (!message) return;
                        addMessage({ role: "user", content: message });
                        const assistantMessage: OpenAI.ChatCompletionMessageParam = {
                            role: "assistant",
                            content: "",
                        };
                        const completion = await openai.chat.completions.create({
                            messages: messages,
                            model: "gpt-3.5-turbo",
                            stream: true,
                        });
                        const stream = completion.toReadableStream();
                        for await (const chunk of stream) {
                            const json = textDecoder.decode(chunk);
                            const data: OpenAI.ChatCompletionChunk = JSON.parse(json);
                            const choice = data.choices.nth(0);
                            if (choice === null || choice.finish_reason === "stop") {
                                controller.write(`data: ${JSON.stringify(null)}\n\n`);
                                controller.flush();
                                break;
                            }
                            const message = choice.delta.content ?? "";
                            assistantMessage.content += message;
                            controller.write(`data: ${JSON.stringify(message)}\n\n`);
                            controller.flush();
                        }
                        if (assistantMessage.content) {
                            addMessage(assistantMessage);
                        }
                        controller.close();
                    },
                });
                return new Response(stream, {
                    headers: {
                        "Content-Type": "text/event-stream",
                        "Cache-Control": "no-cache",
                        Connection: "keep-alive",
                    },
                });
            }

            if (path === "/send" && req.method === Method.POST) {
                const formData = await req.formData();
                const message = formData.get("message");
                if (typeof message !== "string") {
                    return new Response("Bad Request", { status: 400 });
                }
                messageQueue.push(message);
                const form = renderToStaticMarkup(Message({ message }));
                return new Response(form, { status: 200 });
            }
            return new Response("Not found", { status: 404 });
        },
    };

    let server = Bun.serve(options);

    console.log("Listening on http://localhost:3000");

    return {
        async reload() {
            server.stop();
            server = Bun.serve(options);
        },
    };
}

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
    globalThis.context.assets = buildAssets;

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
