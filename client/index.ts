import "./global.client";
import "./style.css";

const converter = new showdown.Converter();
converter.setFlavor("github");
const messageEls = document.querySelectorAll<HTMLDivElement>(".message-content");
for (const el of messageEls) {
    const text = el.innerText;
    el.innerHTML = converter.makeHtml(text);
    const codeEls = el.querySelectorAll("pre");
    for (const codeEl of codeEls) {
        hljs.highlightElement(codeEl);
    }
    el.classList.remove("cloak");
}

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
        let fullText = "";
        const div = document.createElement("div");
        div.classList.add("message-content");
        this.appendChild(div);
        const handleChunk = (event: MessageEvent<string>) => {
            console.log("event", event);
            const message: string | null = JSON.parse(event.data);
            if (message === null) {
                const formButton = document.querySelector<HTMLButtonElement>("#submit");
                if (!formButton) throw new Error("no form button");
                formButton.disabled = false;
                formButton.innerHTML = "Submit";

                eventSource.removeEventListener("message", handleChunk);
                eventSource.close();
                return;
            }
            fullText += message;
            div.innerHTML = converter.makeHtml(fullText);
            hljs.highlightAll();
            if (!scroller.classList.contains("auto-scroll")) return;
            scroller.scrollTo({
                top: scroller.scrollHeight,
                left: 0,
                behavior: "instant",
            });
        };
        eventSource.addEventListener("message", handleChunk);

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
