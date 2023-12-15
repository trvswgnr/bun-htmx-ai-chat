import "./global.client";
import "./style.css";
import "./htmx-streaming";
import "./stream-html-component";

// .............................................................................

function deepMerge<A, B>(a: A, b: B): A & B {
    if (typeof a !== "object" || a === null) return b as any;
    if (typeof b !== "object" || b === null) return a as any;
    const result = Object.assign({}, a) as any;
    for (const key in b) {
        if (!(key in result)) {
            result[key] = b[key];
        } else {
            result[key] = deepMerge(result[key], b[key]);
        }
    }
    return result;
}

// document.addEventListener("stream:chunk", function (e) {
//     e.preventDefault();
//     if (!(e instanceof CustomEvent)) {
//         console.error("stream:chunk event is not a CustomEvent");
//         return;
//     }
//     fetch("/render-markdown", {
//         method: "POST",
//         body: JSON.stringify({ content: e.detail.content }),
//     })
//         .then((res) => res.text())
//         .then((html) => {
//             shittyMorph(e.target, html);
//         });
// });

// document.body.addEventListener("htmx:stream", function (e) {
// if (!(e instanceof CustomEvent)) return;
// if (!(e.target instanceof HTMLElement)) return;
// e.target.dataset.content ??= "";
// e.target.dataset.content += e.detail.content;
// fetch("/render-markdown", {
//     method: "POST",
//     body: JSON.stringify({ content: e.target.dataset.content }),
// })
//     .then((res) => res.text())
//     .then((html) => {
//         if (!(e.target instanceof HTMLElement)) return;
//         e.target.innerHTML = html;
//     });
// });

document.querySelector<HTMLButtonElement>("#pause")?.addEventListener("click", function (e) {
    const content = document.querySelector<HTMLDivElement>("#content");
    // @ts-ignore
    htmx.pauseStream(content);
});
document.querySelector<HTMLButtonElement>("#resume")?.addEventListener("click", function (e) {
    const content = document.querySelector<HTMLDivElement>("#content");
    // @ts-ignore
    htmx.resumeStream(content);
});

const scroller = document.querySelector<HTMLDivElement>(".scroller");
const lastScrollTop = 0;
// if (scroller === null) throw new Error("no `.scroller` element found");
// const handleScroll = () => {
//     if (scroller === null) return;
//     const { scrollTop } = scroller;
//     if (scrollTop < lastScrollTop) {
//         // we're scrolling up
//         scroller.classList.remove("auto-scroll");
//     } else {
//         if (scrollTop > -1) {
//             // we're at the bottom
//             scroller.classList.add("auto-scroll");
//         }
//     }
//     lastScrollTop = scrollTop;
// };

// scroller?.addEventListener("scroll", handleScroll, false);

document.querySelector<HTMLElement>(".chat")?.addEventListener("keyup", function (e) {
    if (!(e.target instanceof HTMLTextAreaElement)) return;
    const button = e.target.form?.querySelector<HTMLButtonElement>("#submit");
    if (!button) return;
    const value = e.target.value.trim();
    button.disabled = value === "";
});

// class StreamingContent extends HTMLElement {
//     constructor() {
//         super();
//     }

//     connectedCallback() {
//         if (scroller === null) throw new Error("no `.scroller` element found");
//         let endpoint = this.getAttribute("endpoint");
//         if (!endpoint) throw new Error("endpoint attribute is required");
//         endpoint = formatEndpoint(endpoint);
//         const eventSource = new EventSource(endpoint);
//         let fullText = "";
//         const div = document.createElement("div");
//         div.classList.add("message-content");
//         this.appendChild(div);
//         const handleChunk = (event: MessageEvent<string>) => {
//             console.log("event", event);
//             const message: string | null = JSON.parse(event.data);
//             if (message === null) {
//                 const formButton = document.querySelector<HTMLButtonElement>("#submit");
//                 if (!formButton) throw new Error("no form button");
//                 formButton.disabled = false;
//                 formButton.innerHTML = "Submit";

//                 eventSource.removeEventListener("message", handleChunk);
//                 eventSource.close();
//                 return;
//             }
//             fullText += message;
//             div.innerHTML = converter.makeHtml(fullText);
//             hljs.highlightAll();
//             if (!scroller.classList.contains("auto-scroll")) return;
//             scroller.scrollTo({
//                 top: scroller.scrollHeight,
//                 left: 0,
//                 behavior: "instant",
//             });
//         };
//         eventSource.addEventListener("message", handleChunk);

//         scroller.scrollTo({
//             top: scroller.scrollHeight,
//             left: 0,
//             behavior: "instant",
//         });
//         scroller.classList.add("auto-scroll");
//     }
// }

// function formatEndpoint(endpoint: string): ValidUrl {
//     const url = new URL(endpoint, window.location.origin);
//     return url.toString() as ValidUrl;
// }

// customElements.define("streaming-content", StreamingContent);

(NodeList as any).prototype.autosize = function () {
    return autosize(this);
};

// document.querySelectorAll("textarea").autosize();
initAutosize();

function initAutosize(selector = "textarea"): void {
    document.querySelectorAll(selector).forEach(resize);
    document.addEventListener("input", (e) => {
        if (!(e.target instanceof Element)) return;
        if (e.target.matches(selector)) autosize(e.target);
    });
}

function autosize(target: HTMLCollectionOf<Element>): void;
function autosize(target: NodeListOf<Element>): void;
function autosize(target: Element): void;
function autosize(target: string): void;
function autosize(target: unknown): void {
    switch (true) {
        case target instanceof HTMLCollection:
        case target instanceof NodeList:
            autosizeAll(target);
            break;
        case target instanceof Element:
            autosizeOne(target);
            break;
        case typeof target === "string": {
            const els = document.querySelectorAll(target);
            autosizeAll(els);
            break;
        }
        default:
            throw new Error("invalid selector");
    }
}

function autosizeAll(target: Iterable<Node>): void {
    for (const el of target) {
        autosizeOne(el);
    }
}

function autosizeOne(target: Node): void {
    resize(target);
    target.addEventListener("input", () => resize(target));
}

/** Resize an element to fit its content */
type ElShape = {
    style: unknown;
    scrollHeight: unknown;
};
function resize(el: Node) {
    assertShape(el, "style", "scrollHeight");
    assertShape(el.style, "resize", "overflow", "height");
    el.style.resize = "none";
    el.style.overflow = "hidden";
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
}

function assertShape<T, K extends PropertyKey>(
    obj: T,
    ...keys: K[]
): asserts obj is T & Record<K, unknown> {
    if (typeof obj !== "object" || obj === null) throw new Error("invalid object");
    if (!keys.every((key) => key in obj)) throw new Error("invalid keys");
}

declare global {
    interface NodeListOf<TNode extends Node> {
        autosize<T extends HTMLTextAreaElement>(this: NodeListOf<T>): void;
    }
}
