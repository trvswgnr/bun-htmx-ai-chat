import { EventType, HtmxInternalApi, InternalData, Verb } from "htmx.org";

let api: HtmxInternalApi;

const xhrStates = {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4,
} as const;

htmx.defineExtension("stream", {
    init(apiRef) {
        api = apiRef;
    },
    onEvent(name, evt) {
        if (evt.detail.eventName === "htmx:beforeRequest") {
            const detail = evt.detail as DetailsMap["htmx:beforeRequest"];
            const xhr = detail.xhr;
            xhr.onload = null; // remove the default onload handler that swaps the content
            let seenBytes = 0;
            const elt = evt.detail.elt;
            xhr.onreadystatechange = function (e) {
                if (xhr.readyState === xhrStates.DONE) {
                    const newData = xhr.response.substr(seenBytes);
                    const beforeSwapDetail: BeforeSwapDetail = {
                        shouldSwap: true,
                        serverResponse: newData,
                        isError: false,
                        ignoreTitle: false,
                    };
                    const beforeSwapEvent = api.triggerEvent(
                        elt,
                        "htmx:beforeSwap",
                        beforeSwapDetail,
                    );
                    if (beforeSwapEvent) {
                        const swapStyle = api.getSwapSpecification(elt).swapStyle;
                        const target = api.getTarget(elt);
                        const settleInfo = api.makeSettleInfo(elt);
                        api.selectAndSwap(swapStyle, target, elt, newData, settleInfo);
                    }
                    seenBytes = xhr.responseText.length;
                }
            };
        }
    },
});

// intercept the htmx:confirm event to stop the xhr request and instead use fetch to stream in the contents
function streamThatShit<T extends EventType>(evt: TaggedEvent<T>) {}

function startStream(detail: ResponseInfo) {
    const { elt, requestConfig } = detail;
    const { verb } = requestConfig;
    const useUrlParams = htmx.config.methodsThatUseUrlParams.indexOf(verb) >= 0;
    const params = useUrlParams ? null : encodeParamsForBody(elt, requestConfig.parameters);

    const xhr = new XMLHttpRequest();
    let seenBytes = 0;
    xhr.open(verb, requestConfig.path);
    xhr.onreadystatechange = function () {
        console.log("state change.. state: " + xhr.readyState);

        if (xhr.readyState == 3) {
            var newData = xhr.response.substr(seenBytes);
            elt.innerHTML = newData;

            seenBytes = xhr.responseText.length;
            console.log("seenBytes: " + seenBytes);
        }
    };

    xhr.addEventListener("error", function (e) {
        console.log("error: " + e);
    });
    xhr.send(params);
    // const response = await xhrToFetch(xhr, params);
    // if (!response.body) {
    //     throw Error("ReadableStream not yet supported in this browser.");
    // }

    // const reader = response.body.getReader();
    // const decoder = new TextDecoder();

    // const read = async (): Promise<void> => {
    //     const { done, value } = await reader.read();
    //     if (done) return;
    //     const decoded = decoder.decode(value);
    //     const chunkEvent = htmx.trigger(elt, "ext:stream:chunk", { content: decoded });
    //     if (chunkEvent) {
    //         // default not prevented, so append the chunk
    //         const beforeSwapDetail: BeforeSwapDetail = {
    //             shouldSwap: true,
    //             serverResponse: decoded,
    //             isError: false,
    //             ignoreTitle: false,
    //         };
    //         const beforeSwapEvent = htmx.trigger(elt, "htmx:beforeSwap", beforeSwapDetail);
    //         if (beforeSwapEvent) {
    //             const swapStyle = api.getSwapSpecification(elt).swapStyle;
    //             const target = api.getTarget(elt);
    //             const settleInfo = api.makeSettleInfo(elt);
    //             api.selectAndSwap(swapStyle, target, elt, decoded, settleInfo);
    //         }
    //     }
    //     return read();
    // };
    // return await read().catch((err: unknown) => {
    //     const error = err instanceof Error ? err : new Error("unknown error");
    //     const errorEvent = htmx.trigger(elt, "ext:stream:error", { error });
    //     if (errorEvent) {
    //         const beforeSwapDetail: BeforeSwapDetail = {
    //             shouldSwap: true,
    //             serverResponse: `<p>Error: ${error.message}</p>`,
    //             isError: true,
    //             ignoreTitle: false,
    //         };
    //         const beforeSwapEvent = htmx.trigger(elt, "htmx:beforeSwap", beforeSwapDetail);
    //         if (beforeSwapEvent) {
    //             const swapStyle = api.getSwapSpecification(elt).swapStyle;
    //             const target = api.getTarget(elt);
    //             const settleInfo = api.makeSettleInfo(elt);
    //             api.selectAndSwap(
    //                 swapStyle,
    //                 target,
    //                 elt,
    //                 beforeSwapDetail.serverResponse,
    //                 settleInfo,
    //             );
    //         }
    //     }
    // });
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

type MaybeCanMatch = {
    matches?: (selector: string) => boolean;
    matchesSelector?: (selector: string) => boolean;
    msMatchesSelector?: (selector: string) => boolean;
    mozMatchesSelector?: (selector: string) => boolean;
    webkitMatchesSelector?: (selector: string) => boolean;
    oMatchesSelector?: (selector: string) => boolean;
};

function usesFormData(elt: HTMLElement): boolean {
    return (
        api.getClosestAttributeValue(elt, "hx-encoding") === "multipart/form-data" ||
        (matches(elt, "form") && getRawAttribute(elt, "enctype") === "multipart/form-data")
    );
}

function matches(elt: MaybeCanMatch, selector: string): boolean {
    const matchesFunction =
        elt.matches ||
        elt.matchesSelector ||
        elt.msMatchesSelector ||
        elt.mozMatchesSelector ||
        elt.webkitMatchesSelector ||
        elt.oMatchesSelector;
    return (matchesFunction && matchesFunction.call(elt, selector)) || false;
}

function getRawAttribute(elt: Element, name: string): string | null {
    return elt.getAttribute && elt.getAttribute(name);
}

function encodeParamsForBody(elt: HTMLElement, filteredParameters: Record<string, string>) {
    if (usesFormData(elt)) {
        return makeFormData(filteredParameters);
    }
    return urlEncode(filteredParameters);
}

function makeFormData(values: Record<string, string | string[]>) {
    var formData = new FormData();
    for (var name in values) {
        const value = values[name];
        if (Array.isArray(value)) {
            value.forEach((v) => formData.append(name, v));
            continue;
        }
        formData.append(name, value);
    }
    return formData;
}

function urlEncode(values: Record<string, string | string[]>) {
    var returnStr = "";
    for (var name in values) {
        var value = values[name];
        if (Array.isArray(value)) {
            value.forEach((v) => {
                returnStr = appendParam(returnStr, name, v);
            });
        } else {
            returnStr = appendParam(returnStr, name, value);
        }
    }
    return returnStr;
}

function appendParam(returnStr: string, name: string | number | boolean, realValue: unknown) {
    if (returnStr !== "") {
        returnStr += "&";
    }
    var s = encodeURIComponent(convertToPrimitive(realValue));
    returnStr += encodeURIComponent(name) + "=" + s;
    return returnStr;
}

function convertToPrimitive(value: unknown): string | number | boolean {
    switch (typeof value) {
        case "string":
            return value;
        case "number":
            return value;
        case "boolean":
            return value;
        case "object":
            if (value instanceof Date) {
                return value.toISOString();
            }
            return JSON.stringify(value);
        default:
            return "";
    }
}
