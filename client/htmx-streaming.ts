import { EventType, HtmxInternalApi, InternalData, Verb } from "htmx.org";

let api: HtmxInternalApi;

htmx.defineExtension("stream", {
    init(apiRef) {
        api = apiRef;
    },
    transformResponse(_: unknown, xhr: XMLHttpRequest, elt: HTMLElement & { seenBytes?: number }) {
        if (!elt.seenBytes) {
            elt.seenBytes = 0;
        }
        return xhr.responseText.slice(elt.seenBytes);
    },
    onEvent(name, evt) {
        if (name === "htmx:beforeRequest") {
            var detail = evt.detail as DetailsMap["htmx:beforeRequest"];
            var xhr = detail.xhr;
            var onloadHandler = xhr.onload!.bind(xhr);
            var elt = detail.elt as HTMLElement & { seenBytes: number };
            xhr.onload = null;
            elt.seenBytes = 0;
            xhr.onreadystatechange = function (ev) {
                if (xhr.readyState === 3) {
                    const progressEvent = new ProgressEvent("ext:stream:chunk", {
                        ...ev,
                        lengthComputable: false,
                        loaded: xhr.responseText.length,
                        total: xhr.responseText.length,
                    });
                    onloadHandler(progressEvent);
                    elt.seenBytes = xhr.responseText.length;
                }
            };
        }
    },
});

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
