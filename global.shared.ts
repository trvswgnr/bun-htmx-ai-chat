import type OpenAI from "openai";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "streaming-content": {
                endpoint: ValidEndpoint;
                trigger?: string;
                children: React.ReactNode;
            };
        }
    }

    interface Array<T> {
        nth(n: number): T | null;
    }

    type ValidUrl = `http${"s" | ""}://${string}`;
    type ValidUrlPath = `/${string}`;
    type ValidEndpoint = ValidUrl | ValidUrlPath;

    type MessageParam = OpenAI.Chat.Completions.ChatCompletionMessageParam;

    type GlobalContext = {
        messages: MessageParam[];
        assets: Record<string, string[]>;
    };

    var context: GlobalContext;
}

Array.prototype.nth = function (n: number) {
    return this[n] ?? null;
};
