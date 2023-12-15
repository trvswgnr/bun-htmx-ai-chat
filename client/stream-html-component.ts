class StreamHtml extends HTMLElement {
    private abortController: AbortController | null = null;
    public fullContent: string = "";

    constructor() {
        super();
    }

    connectedCallback() {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = "<p>Loading...</p>";
        this.appendChild(wrapper);
        this.fullContent = "";
        this.abortController = new AbortController();
        const signal = this.abortController.signal;

        fetch("/test-stream", { signal })
            .then((response) => {
                if (!response.body) {
                    throw Error("ReadableStream not yet supported in this browser.");
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                const read = (): Promise<void> => {
                    return reader.read().then(({ done, value }) => {
                        if (done) {
                            return;
                        }
                        this.fullContent += decoder.decode(value);
                        const event = new CustomEvent("stream:chunk", {
                            detail: {
                                content: this.fullContent,
                            },
                            bubbles: true,
                            cancelable: true,
                        });
                        wrapper.dispatchEvent(event);
                        if (!event.defaultPrevented) {
                            wrapper.innerHTML = this.fullContent;
                        }
                        return read();
                    });
                };

                return read();
            })
            .catch((error) => {
                wrapper.innerHTML += `<p>ahhhh${error.message}</p>`;
            });
    }

    disconnectedCallback() {
        if (this.abortController) {
            this.abortController.abort();
        }
    }
}

customElements.define("stream-html", StreamHtml);
// document.getElementById("messages")?.appendChild(document.createElement("stream-html"));
