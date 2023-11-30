import type OpenAI from "openai";
import "./global.client";
import "./style.css";

const scroller = document.querySelector<HTMLDivElement>(".scroller");
let lastScrollTop = 0;
if (scroller === null) throw new Error("no `.scroller` element found");
const handleScroll = () => {
    const { scrollTop } = scroller;
    if (scrollTop < lastScrollTop) {
        // we're scrolling up
        scroller.classList.remove("auto-scroll");
    } else {
        if (scrollTop > -1) {
            // we're at the bottom
            scroller.classList.add("auto-scroll");
        }
    }
    lastScrollTop = scrollTop;
};
scroller.addEventListener("scroll", handleScroll, false);

class StreamingContent extends HTMLElement {
    public eventSource: EventSource | null = null;
    public trigger: string = "message";
    constructor() {
        super();
    }

    public static messageHandler<T>(this: StreamingContent, event: MessageEvent<T>) {
        if (this.eventSource === null) return;
        const data: OpenAI.ChatCompletionChunk = JSON.parse(String(event.data));
        const choice = data.choices[0];
        if (choice === undefined || choice.finish_reason === "stop") {
            this.eventSource.removeEventListener(
                this.trigger,
                StreamingContent.messageHandler.bind(this),
            );
            this.eventSource.close();
            return;
        }
        const message = choice.delta.content;
        this.innerHTML += message;
    }

    connectedCallback() {
        let endpoint = this.getAttribute("endpoint");
        this.trigger = this.getAttribute("event") || "message";
        if (!endpoint) throw new Error("endpoint attribute is required");
        endpoint = formatEndpoint(endpoint);
        this.eventSource = new EventSource(endpoint);
        this.eventSource.addEventListener(this.trigger, StreamingContent.messageHandler.bind(this));
    }
}

function formatEndpoint(endpoint: string): ValidUrl {
    const url = new URL(endpoint, window.location.origin);
    return url.toString() as ValidUrl;
}

customElements.define("streaming-content", StreamingContent);
