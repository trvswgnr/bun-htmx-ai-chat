/** @type {Import("htmx.org").HtmxInternalApi} */
let api;

htmx.defineExtension("stream", {
    init(apiRef) {
        api = apiRef;
    },
    onEvent(name, evt) {
        if (name === "htmx:beforeRequest") {
            evt.preventDefault();
            evt.detail.xhr.abort();
            const startEvent = htmx.trigger(evt.detail.elt, "ext:stream:start", evt.detail);
            if (startEvent) {
                // default not prevented, so start the stream
                startStream(evt.detail);
            }
            return;
        }
    },
});

async function startStream(detail) {
    const { elt, requestConfig, xhr } = detail;
    const { path, verb } = requestConfig;
    const url = new URL(path, window.location.origin);
    const controller = new AbortController();
    const signal = controller.signal;
    const init = {
        method: verb,
        signal,
    };
    // if it should have a body, add it
    if (verb !== "get") {
        var useUrlParams = htmx.config.methodsThatUseUrlParams.indexOf(verb) >= 0;
        if (useUrlParams) {
            const params = new URLSearchParams(requestConfig.parameters);
            params.forEach((value, key) => {
                url.searchParams.append(key, value);
            });
        } else {
            init.body = htmx.buildRequestBody(elt, requestConfig.unfilteredParameters);
        }
    }
    console.log(init);

    const response = await fetch(url.toString(), new XMLHttpRequest());
    if (!response.body) {
        throw Error("ReadableStream not yet supported in this browser.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const read = async (): Promise<void> => {
        const { done, value } = await reader.read();
        if (done) return;
        const decoded = decoder.decode(value);
        const chunkEvent = htmx.trigger(elt, "ext:stream:chunk", { content: decoded });
        if (chunkEvent) {
            // default not prevented, so append the chunk
            const beforeSwapDetail: BeforeSwapDetail = {
                shouldSwap: true,
                serverResponse: decoded,
                isError: false,
                ignoreTitle: false,
            };
            const beforeSwapEvent = htmx.trigger(elt, "htmx:beforeSwap", beforeSwapDetail);
            if (beforeSwapEvent) {
                const swapStyle = api.getSwapSpecification(elt).swapStyle;
                const target = api.getTarget(elt);
                const settleInfo = api.makeSettleInfo(elt);
                api.selectAndSwap(swapStyle, target, elt, decoded, settleInfo);
            }
        }
        return read();
    };
    return await read().catch((err: unknown) => {
        const error = err instanceof Error ? err : new Error("unknown error");
        const errorEvent = htmx.trigger(elt, "ext:stream:error", { error });
        if (errorEvent) {
            const beforeSwapDetail: BeforeSwapDetail = {
                shouldSwap: true,
                serverResponse: `<p>Error: ${error.message}</p>`,
                isError: true,
                ignoreTitle: false,
            };
            const beforeSwapEvent = htmx.trigger(elt, "htmx:beforeSwap", beforeSwapDetail);
            if (beforeSwapEvent) {
                const swapStyle = api.getSwapSpecification(elt).swapStyle;
                const target = api.getTarget(elt);
                const settleInfo = api.makeSettleInfo(elt);
                api.selectAndSwap(
                    swapStyle,
                    target,
                    elt,
                    beforeSwapDetail.serverResponse,
                    settleInfo,
                );
            }
        }
    });
}

// function triggerExtError(elt: HTMLElement) {
//     return;
// }

// function assertIsValidEventName<T extends keyof DetailsMap>(name: string): asserts name is T {
//     const mutEventNames: string[] = [...eventNames];
//     if (!mutEventNames.includes(name) && name.match(/^ext:/) === null) {
//         throw new Error(`invalid event name: ${name}`);
//     }
// }

function taggedEvent<T extends keyof DetailsMap, X extends { detail: Partial<DetailsMap[T]> }>(
    name: T,
    obj: X,
): X & { detail: DetailsMap[T] } {
    obj.detail.eventName = name;
    return obj as X & { detail: DetailsMap[T] };
}

type TaggedEvent<T extends keyof DetailsMap> = CustomEvent<DetailsMap[T]>;

type DetailsMap = {
    [K in keyof UntaggedDetailsMap as K]: { eventName: K } & UntaggedDetailsMap[K];
};

type RequestConfig = {
    boosted: boolean;
    useUrlParams: boolean;
    parameters: Record<string, string>;
    unfilteredParameters: Record<string, string>;
    headers: Record<string, string>;
    target: HTMLElement;
    verb: Verb;
    errors: any[];
    withCredentials: boolean;
    timeout: number;
    path: `/${string}`;
    triggeringEvent: Event;
};

type Etc = {
    targetOverride?: any;
    returnPromise: any;
    handler?: any;
    headers?: any;
    values?: any;
    swapOverride?: any;
    select?: any;
    credentials?: any;
    timeout?: any;
};

type ResponseInfo = {
    boosted: boolean;
    elt: HTMLElement;
    etc: Etc;
    pathInfo: {
        anchor: string | null;
        finalRequestPath: string;
        requestPath: string;
    };
    select: string | null;
    requestConfig: RequestConfig;
    target: HTMLElement;
    xhr: XMLHttpRequest;
};

type BeforeSwapDetail = {
    shouldSwap: boolean;
    serverResponse: string;
    isError: boolean;
    ignoreTitle: boolean;
};

type UntaggedDetailsMap = {
    "htmx:confirm": {
        target: HTMLElement;
        elt: HTMLElement;
        path: string;
        verb: Verb;
        triggeringEvent: Event;
        etc: Etc;
        issueRequest: (skipConfirmation: boolean) => Promise<unknown>;
        confirmQuestion: string;
    };
    "htmx:beforeRequest": ResponseInfo;
    "htmx:beforeSend": ResponseInfo;
    "htmx:configRequest": RequestConfig;
    "htmx:beforeSwap": BeforeSwapDetail;
    "htmx:oobBeforeSwap": {
        shouldSwap: boolean;
        target: HTMLElement;
        fragment: DocumentFragment;
    };
    "htmx:oobAfterSwap": {
        shouldSwap: boolean;
        target: HTMLElement;
        fragment: DocumentFragment;
    };
    "htmx:beforeCleanupElement": {};
    "htmx:trigger": {};
    "htmx:revealed": {};
    "htmx:validation:halted": any[] & {};
    "htmx:sseMessage": {
        data: any;
    };
    "htmx:intersect": {};
    "htmx:beforeProcessNode": {};
    "htmx:afterProcessNode": {};
    "htmx:error": {
        errorInfo: { error: any };
    };
    "htmx:historyItemCreated": {
        item: {
            url: string;
            content: any;
            title: string;
            scroll: number;
        };
        cache: {
            url: string;
            content: any;
            title: string;
            scroll: number;
        }[];
    };
    "htmx:beforeHistorySave": {
        path: string;
        historyElt: HTMLElement;
    };
    "htmx:historyCacheMiss": {
        path: string;
        xhr: XMLHttpRequest;
    };
    "htmx:historyCacheMissLoad": {
        path: string;
        xhr: XMLHttpRequest;
    };
    "htmx:historyRestore":
        | {
              path: string;
              cacheMiss: boolean;
              serverResponse: XMLHttpRequest["response"];
          }
        | {
              path: string;
              item: null | {
                  url: string;
                  content: any;
                  title: string;
                  scroll: number;
              };
          };
    "htmx:historyCacheMissLoadError": {
        path: string;
        xhr: XMLHttpRequest;
    };
    "htmx:validate": {};
    "htmx:validation:failed": {
        message: string;
        validity: boolean;
    };
    "htmx:validateUrl": {
        url: string;
        sameHost: boolean;
        boosted?: boolean;
        useUrlParams: boolean;
        parameters: any;
        unfilteredParameters: any;
        headers: Record<string, string>;
        target: HTMLElement;
        verb: Verb;
        errors: any[];
        withCredentials: boolean;
        timeout: number;
        path: string;
        triggeringEvent: Event;
    };
    "htmx:timeout": {};
    "htmx:targetError": {};
    "htmx:swapError": {};
    "htmx:sseError": {};
    "htmx:sendError": {};
    "htmx:responseError": {};
    "htmx:replacedInHistory": {};
    "htmx:pushedIntoHistory": {};
    "htmx:beforeHistoryUpdate": {};
    "htmx:prompt": {};
    "htmx:onLoadError": {};
    "htmx:oobErrorNoTarget": {};
    "htmx:noSSESourceError": {};
    "htmx:historyCacheMissError": {};
    "htmx:historyCacheError": {};
    "htmx:beforeTransition": {};
    "htmx:abort": {};
    "htmx:xhr:abort": {};
    "htmx:xhr:progress": {};
    "htmx:xhr:loadend": {};
    "htmx:xhr:loadstart": {};
    "htmx:validation:validate": {};
    "htmx:load": {};
    "htmx:beforeOnLoad": {};
    "htmx:afterOnLoad": {};
    "htmx:afterRequest": {};
    "htmx:afterSettle": {};
    "htmx:afterSwap": {};
};
