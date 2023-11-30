import { renderToReadableStream } from "react-dom/server";
import OpenAI from "openai";
const openai = new OpenAI();
import { Chat, FormWithMessage } from "./server";

enum Method {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a helpful assistant." },
];

const messageQueue: string[] = [];

const outdir = "./public";

await cleanFolder(outdir);

const build = await Bun.build({
    entrypoints: ["./client/index.ts"],
    outdir,
    naming: "[dir]/[name].[hash].[ext]",
    sourcemap: "external",
});

const currentDir = import.meta.dir; // *note: no trailing slash
const assets = build.outputs.map((x) => x.path.replace(currentDir, "."));

Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        const path = url.pathname;
        if (path.startsWith("/public")) {
            return new Response(Bun.file(`.${url.pathname}`));
        }

        if (path === "/" && req.method === Method.GET) {
            const html = await renderToReadableStream(Chat({ assets }));
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
                    messages.push({ role: "user", content: message });
                    const completion = await openai.chat.completions.create({
                        messages: messages,
                        model: "gpt-3.5-turbo",
                        stream: true,
                    });
                    const stream = completion.toReadableStream();
                    for await (const chunk of stream) {
                        const json = textDecoder.decode(chunk);
                        controller.write(`event: chunk\ndata: ${json}\n\n`);
                        controller.flush();
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

async function cleanFolder(folder: `./${string}`) {
    const { readdir, unlink } = await import("node:fs/promises");
    const files = await readdir(folder);
    for (const file of files) {
        await unlink(`${folder}/${file}`);
    }
}
