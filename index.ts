import { renderToReadableStream } from "react-dom/server";
import OpenAI from "openai";
const openai = new OpenAI();
import { Chat, FormWithMessage } from "./server";
import _messages from "./db/messages.json";

enum Method {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

const messages = _messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

async function addMessage(message: OpenAI.Chat.Completions.ChatCompletionMessageParam) {
    messages.push(message);
    const file = Bun.file("./db/messages.json");
    const writer = file.writer();
    writer.write(JSON.stringify(messages));
    writer.end();
}

const messageQueue: string[] = [];

await build();

Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        const path = url.pathname;
        if (path.startsWith("/public")) {
            return new Response(Bun.file(`.${url.pathname}`));
        }

        if (path === "/" && req.method === Method.GET) {
            const html = await renderToReadableStream(Chat({ messages }));
            return new Response(html, {
                headers: {
                    "Content-Type": "text/html",
                },
            });
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
            const form = await renderToReadableStream(FormWithMessage({ message }));
            return new Response(form, { status: 200 });
        }
        return new Response("Not found", { status: 404 });
    },
});

declare global {
    var buildAssets: Record<string, string[]>;
}

async function build() {
    const outdir = "./public";

    await cleanFolder(outdir);

    const build = await Bun.build({
        entrypoints: ["./client/index.ts"],
        outdir,
        naming: "[dir]/[name].[hash].[ext]",
        sourcemap: "external",
    });

    const currentDir = import.meta.dir; // *note: no trailing slash

    const buildAssetPaths: string[] = [];
    for (const output of build.outputs) {
        const path = output.path.replace(currentDir, ".");
        buildAssetPaths.push(path);
    }
    const buildAssets: Record<string, string[]> = {};
    for (const path of buildAssetPaths) {
        const ext = path.split(".").pop()!;
        buildAssets[ext] = buildAssets[ext] ?? [];
        buildAssets[ext].push(path);
    }
    globalThis.buildAssets = buildAssets;
}

async function cleanFolder(folder: `./${string}`) {
    const { readdir, unlink } = await import("node:fs/promises");
    const files = await readdir(folder);
    for (const file of files) {
        await unlink(`${folder}/${file}`);
    }
}

console.log("Listening on http://localhost:3000");
