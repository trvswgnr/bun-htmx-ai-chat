import messages from "~/db/messages.json";
import { Arcdown } from "arcdown";

declare global {
    type GlobalContext = {
        messages: MessageParam[];
        assets: Record<string, string[] | undefined>;
    };
}

declare module "./util" {
    var __context: GlobalContext;
}

const arcdown = new Arcdown();
const htmlMessages: typeof messages = [];
for (const message of messages) {
    console.log("server message", message);
    const { html } = await arcdown.render(message.content);
    htmlMessages.push({ ...message, content: html });
}

(globalThis as any).__context ??= {
    messages: htmlMessages as any,
    assets: {},
};

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
