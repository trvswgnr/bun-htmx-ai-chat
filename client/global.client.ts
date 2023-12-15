import "~/global.shared";
import type * as _htmx from "htmx.org";

declare global {
    var htmx: typeof _htmx;
    var Idiomorph: any;
}

export const eventNames = [
    "htmx:abort",
    "htmx:afterOnLoad",
    "htmx:afterProcessNode",
    "htmx:afterRequest",
    "htmx:afterSettle",
    "htmx:afterSwap",
    "htmx:beforeCleanupElement",
    "htmx:beforeOnLoad",
    "htmx:beforeProcessNode",
    "htmx:beforeRequest",
    "htmx:beforeSend",
    "htmx:beforeSwap",
    "htmx:beforeTransition",
    "htmx:configRequest",
    "htmx:confirm",
    "htmx:error",
    "htmx:historyCacheError",
    "htmx:historyCacheMiss",
    "htmx:historyCacheMissError",
    "htmx:historyCacheMissLoad",
    "htmx:historyRestore",
    "htmx:beforeHistorySave",
    "htmx:load",
    "htmx:noSSESourceError",
    "htmx:oobAfterSwap",
    "htmx:oobBeforeSwap",
    "htmx:oobErrorNoTarget",
    "htmx:onLoadError",
    "htmx:prompt",
    "htmx:beforeHistoryUpdate",
    "htmx:pushedIntoHistory",
    "htmx:replacedInHistory",
    "htmx:responseError",
    "htmx:sendError",
    "htmx:sseError",
    "htmx:swapError",
    "htmx:targetError",
    "htmx:timeout",
    "htmx:trigger",
    "htmx:validateUrl",
    "htmx:validation:validate",
    "htmx:validation:failed",
    "htmx:validation:halted",
    "htmx:xhr:abort",
    "htmx:xhr:loadstart",
    "htmx:xhr:loadend",
    "htmx:xhr:progress",
] as const;

declare module "htmx.org" {
    export function createStream(url: string): Promise<ReadableStreamDefaultReader<Uint8Array>>;
    export function pauseStream(elt: HTMLElement): void;
    export function resumeStream(elt: HTMLElement): void;
    /**
     * Triggers a given event on an element
     *
     * https://htmx.org/api/#trigger
     *
     * @param elt element to trigger the event on
     * @param name name of the event to trigger
     * @param detail details for the event
     * @returns true if the event was not canceled, false otherwise
     */
    export function trigger(elt: Element, name: string, detail: unknown): boolean;

    interface HtmxConfig {
        methodsThatUseUrlParams: string[];
    }

    interface HtmxExtension {
        init?(apiRef: HtmxInternalApi): void;
    }

    interface HtmxTriggerSpecification {
        sseEvent?: string;
        trigger: string;
        root?: Element | Document | null;
        threshold?: string;
        delay?: number;
        pollInterval?: number;
    }

    interface HtmxSwapSpecification {
        swapStyle: SwapStyle;
        swapDelay: number;
        settleDelay: number;
    }

    interface HtmxSettleInfo {
        title?: string;
        tasks: (() => void)[];
        elts: Element[];
    }

    interface ListenerInfo {
        listener: EventListener;
        on: HTMLElement;
        trigger: string;
    }

    /** the http verb used in the request (lowercase) */
    type Verb = "get" | "post" | "put" | "delete" | "patch";

    interface KnownInternalData {
        initHash?: number | null;
        listenerInfos?: ListenerInfo[];
        path?: string;
        verb?: Verb;
        lastButtonClicked?: Element | null;
        timeout?: number;
        webSocket?: WebSocket;
        sseEventSource?: EventSource;
        onHandlers?: { event: string; listener: EventListener }[];
        xhr?: XMLHttpRequest | null;
        requestCount?: number;
    }

    type InternalData = KnownInternalData & Record<PropertyKey, any>;

    interface InputValues {
        errors: any[];
        values: Record<string, string>;
    }

    interface Pollable {
        polling: boolean;
    }

    interface TriggerHandler {
        (elt: Element, evt: Event): void;
        (): void;
    }

    type SwapStyle =
        | "innerHTML"
        | "outerHTML"
        | "afterbegin"
        | "beforebegin"
        | "afterend"
        | "beforeend"
        | "none"
        | "delete";

    export interface HtmxInternalApi {
        addTriggerHandler(
            elt: Element,
            triggerSpec: HtmxTriggerSpecification,
            nodeData: Pollable,
            handler: TriggerHandler,
        ): void;
        bodyContains(elt: Node): boolean;
        canAccessLocalStorage(): boolean;
        findThisElement(elt: HTMLElement, attribute: string): HTMLElement | null;
        filterValues(inputValues: Record<string, string>, elt: HTMLElement): Record<string, string>;
        hasAttribute(
            elt: { hasAttribute: (arg0: string) => boolean },
            qualifiedName: string,
        ): boolean;
        getAttributeValue(elt: HTMLElement, qualifiedName: string): string | null;
        getClosestAttributeValue(elt: HTMLElement, attributeName: string): string | null;
        getClosestMatch(
            elt: HTMLElement,
            condition: (e: HTMLElement) => boolean,
        ): HTMLElement | null;
        getExpressionVars(elt: HTMLElement): Record<string, string>;
        getHeaders(elt: HTMLElement, target: HTMLElement, prompt: string): Record<string, string>;
        getInputValues(elt: HTMLElement, verb: string): InputValues;
        getInternalData(elt: HTMLElement): InternalData;
        getSwapSpecification(elt: HTMLElement, swapInfoOverride?: string): HtmxSwapSpecification;
        getTriggerSpecs(elt: HTMLElement): HtmxTriggerSpecification[];
        getTarget(elt: HTMLElement): Element | null;
        makeFragment(resp: any): Element | DocumentFragment;
        mergeObjects<A extends object, B extends object>(obj1: A, obj2: B): A & B;
        makeSettleInfo(target: Element): HtmxSettleInfo;
        oobSwap(oobValue: string, oobElement: HTMLElement, settleInfo: HtmxSettleInfo): string;
        querySelectorExt(eltOrSelector: any, selector: string): Element | null;
        selectAndSwap(
            swapStyle: SwapStyle,
            target: Element | null,
            elt: Element | null,
            responseText: string,
            settleInfo: HtmxSettleInfo,
            selectOverride?: string | null,
        ): void;
        settleImmediately(tasks: { call: () => void }[]): void;
        shouldCancel(evt: Event, elt: HTMLElement): boolean;
        triggerEvent(elt: Element | null, eventName: string, detail?: EventDetail): boolean;
        triggerErrorEvent(elt: HTMLElement, eventName: string, detail?: EventDetail): void;
        withExtensions(elt: HTMLElement, toDo: (extension: HtmxExtension) => void): void;
    }

    type EventDetail = {
        [key: PropertyKey]: unknown;
    };

    type EventType = (typeof eventNames)[number];
}
