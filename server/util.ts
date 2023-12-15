import { Arcdown } from "~/lib/arcdown/src";

declare global {
    type Message = {
        role: string;
        content: string;
    };
    type MessageWithHtml = Message & { html: string };
    type GlobalContext = {
        dbFile: string;
        messages: MessageParam[];
        messagesWithHtml: MessageWithHtml[];
        assets: Record<string, string[] | undefined>;
    };
}

const __context: GlobalContext = {
    messages: [],
    messagesWithHtml: [],
    dbFile: "./db/messages.json",
    assets: {},
};
await refreshMessages();

export function useContext(): GlobalContext;
export function useContext<T extends keyof GlobalContext>(key: T): GlobalContext[T];
export function useContext<T extends keyof GlobalContext>(key?: T) {
    if (key === undefined) {
        return __context as any;
    }
    return __context[key];
}

export function setContext<T extends keyof GlobalContext>(key: T, value: GlobalContext[T]) {
    __context[key] = value;
}

export async function refreshMessages() {
    const file = Bun.file("./db/messages.json");
    const messages = await file.json<Message[]>();
    const arcdown = new Arcdown();
    const messagesWithHtml: MessageWithHtml[] = [];
    for (const message of messages) {
        const { html } = await arcdown.render(message.content);
        messagesWithHtml.push({ ...message, html });
    }
    setContext("messages", messages as MessageParam[]);
    setContext("messagesWithHtml", messagesWithHtml);
    return { messages, messagesWithHtml };
}
