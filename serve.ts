import { renderToReadableStream } from "react-dom/server";
import OpenAI from "openai";
const openai = new OpenAI();
import _messages from "~/db/messages.json";
import { App, ChatMessages, Message, Test } from "~/server/chat-ui";
import { refreshMessages, useContext } from "~/server/util";
import { build } from "./build";
import { Arcdown } from "~/lib/arcdown/src";

await build();
serve();

const messages = useContext("messages");
const messageQueue: string[] = [];

enum Method {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

export function serve() {
    const server = Bun.serve({
        port: 3000,
        async fetch(req) {
            const url = new URL(req.url);
            const path = url.pathname;
            if (path === "/test-htmx") {
                const html = `
                    <form hx-ext="stream" hx-get="/test-htmx">
                        <input type="hidden" name="foo" value="ayyyyy" />
                        <button>WOOOOOOOOO</button>
                    </form>
                `;
                return new Response(html, {
                    headers: {
                        "Content-Type": "text/html",
                    },
                });
            }

            if (path === "/test-stream") {
                const raw = await Bun.file("./server/markdown-sampler.md").text();
                const arcdown = new Arcdown();
                const renderResult = await arcdown.render(raw);
                const html: string = renderResult.html;
                const form = `
                    <form hx-ext="stream" hx-get="/test-stream">
                        <input type="hidden" name="foo" value="ayyyyy" />
                        <button>WOOOOOOOOO</button>
                    </form>
                `;
                let fullText = form;
                const decoder = new TextDecoder();

                const stream = new ReadableStream({
                    start(controller) {},
                    async pull(controller) {
                        for await (const chunk of await chunks(html, 100)) {
                            await new Promise((resolve) => setTimeout(resolve, 100));
                            fullText += decoder.decode(chunk);
                            controller.enqueue(fullText);
                        }
                        controller.close();
                    },
                });
                return new Response(stream, {
                    headers: {
                        "Content-Type": "text/html",
                    },
                });
            }
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
                const body = new ReadableStream({
                    start(controller) {
                        controller.enqueue("<h4>Assistant</h4>");
                    },
                    async pull(controller) {
                        for await (const chunk of stream) {
                            const textDecoder = new TextDecoder();
                            const json = textDecoder.decode(chunk);
                            const data: OpenAI.ChatCompletionChunk = JSON.parse(json);
                            const choice = data.choices.nth(0);
                            if (choice === null || choice.finish_reason === "stop") {
                                controller.close();
                                return;
                            }
                            const message = choice.delta.content ?? "";
                            controller.enqueue(message);
                        }
                        controller.close();
                    },
                });
                return new Response(body, {
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

            if (path.startsWith("/pkg")) {
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

            if (path === "/render-markdown" && req.method === Method.POST) {
                const arcdown = new Arcdown({
                    hljs: {
                        languages: ["javascript", "typescript", "bash", "json", "sh"],
                    },
                });
                const data = await req.json();
                const { html } = await arcdown.render(data.content);
                return new Response(html, {
                    status: 200,
                    headers: {
                        "Content-Type": "text/html",
                    },
                });
            }

            if (path === "/message") {
                const message = messageQueue.shift() || "";
                const textDecoder = new TextDecoder();
                const stream = new ReadableStream({
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
                                break;
                            }
                            const message = choice.delta.content ?? "";
                            assistantMessage.content += message;
                            controller.enqueue(message);
                            process.stdout.write(message);
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
                const form = await renderToReadableStream(Message({ message }));
                return new Response(form, { status: 200 });
            }
            return new Response("Not found", { status: 404 });
        },
    });
    console.log("Listening on http://localhost:3000");
    return server;
}

async function addMessage(message: MessageParam) {
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
    await refreshMessages();
}

/**
 * Splits an async iterable into chunks of a given size (in bytes).
 */
async function chunks(array: string, size: number): Promise<Uint8Array[]>;
async function chunks(
    array: AsyncIterableIterator<Uint8Array>,
    size: number,
): Promise<Uint8Array[]>;
async function chunks(array: Uint8Array, size: number): Promise<Uint8Array[]>;
async function chunks(
    array: AsyncIterableIterator<Uint8Array> | string | Uint8Array,
    size: number,
): Promise<Uint8Array[]> {
    if (array instanceof Uint8Array) {
        return chunks(asyncIterableIteratorFrom(array), size);
    }
    if (typeof array === "string") {
        const encoder = new TextEncoder();
        const buffer = encoder.encode(array);
        return chunks(buffer, size);
    }
    const arrs: Uint8Array[] = [];
    let offset = 0;
    for await (const item of array) {
        let len = item.byteLength;
        while (len > 0) {
            const buffer = item.buffer.slice(offset, offset + size);
            arrs.push(new Uint8Array(buffer));
            offset += Math.min(size, len);
            len -= size;
        }
    }
    return arrs;
}

async function* asyncIterableIteratorFrom<T>(item: T): AsyncIterableIterator<T> {
    yield item;
}
