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
    function chain<T>(...iterables: AsyncIterable<T>[]): AsyncGenerator<T>;
}

Array.prototype.nth = function (n: number) {
    return this[n] ?? null;
};

globalThis.chain = async function* (...iterables) {
    const iterators = iterables.map((iterable) => iterable[Symbol.asyncIterator]());
    while (true) {
        const result = await Promise.any(iterators.map((iterator) => iterator.next()));
        if (result.done) {
            return;
        }
        yield result.value;
    }
};
