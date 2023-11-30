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
    constructor() {
        super();
    }

    connectedCallback() {
        if (scroller === null) throw new Error("no `.scroller` element found");
        let endpoint = this.getAttribute("endpoint");
        if (!endpoint) throw new Error("endpoint attribute is required");
        endpoint = formatEndpoint(endpoint);
        const eventSource = new EventSource(endpoint);
        const handleChunk = (event: MessageEvent<string>) => {
            const data: OpenAI.ChatCompletionChunk = JSON.parse(event.data);
            const choice = data.choices.nth(0);
            if (choice === null || choice.finish_reason === "stop") {
                eventSource.removeEventListener("chunk", handleChunk);
                eventSource.close();
                const formButton = document.querySelector<HTMLButtonElement>("#submit");
                if (!formButton) throw new Error("no form button");
                formButton.disabled = false;
                formButton.innerHTML = "Submit";
                return;
            }
            const message = choice.delta.content;
            this.innerHTML += message;
            if (!scroller.classList.contains("auto-scroll")) return;
            scroller.scrollTo({
                top: scroller.scrollHeight,
                left: 0,
                behavior: "instant",
            });
        };
        eventSource.addEventListener("chunk", handleChunk);

        scroller.scrollTo({
            top: scroller.scrollHeight,
            left: 0,
            behavior: "instant",
        });
        scroller.classList.add("auto-scroll");
    }
}

function formatEndpoint(endpoint: string): ValidUrl {
    const url = new URL(endpoint, window.location.origin);
    return url.toString() as ValidUrl;
}

customElements.define("streaming-content", StreamingContent);
