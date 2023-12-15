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

// declare global {
//     class Arcdown {
//         static slugify: (x: any) => string;
//         static findLanguages(mdContent: string): Set<string>;
//         constructor(options?: {
//             markdownIt?: object;
//             plugins?: object;
//             // renderer?: MarkdownIt;
//             renderer?: any;
//             hljs?: {
//                 classString?: string;
//                 ignoreIllegals?: boolean;
//                 languages?: object;
//                 sublanguages?: object;
//                 plugins?: object[];
//             };
//             pluginOverrides?: {
//                 markdownItClass?: object | boolean;
//                 markdownItExternalAnchor?: object | boolean;
//                 markdownItAnchor?: object | boolean;
//                 markdownItToc?: object | boolean;
//             };
//         });
//         render(mdContent: Buffer | string): Promise<{
//             html: string;
//             tocHtml: string;
//             title?: string;
//             slug?: string;
//             frontmatter?: Record<string, unknown>;
//         }>;
//     }
// }
