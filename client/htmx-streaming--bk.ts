// import type { HtmxExtension } from "htmx.org";

// document.body.addEventListener("htmx:load", async (event) => {
//     if (!(event.target instanceof HTMLElement)) return;
//     if (!event.target.dataset.stream) return;
//     const endpoint = event.target.dataset.stream;
// });

// async function processText(
//     result: ReadableStreamReadResult<Uint8Array>,
//     el: HTMLElement,
//     reader: ReadableStreamDefaultReader,
//     decoder: TextDecoder,
// ): Promise<ReadableStreamReadResult<Uint8Array>> {
//     const { done, value } = result;
//     if (done) {
//         return Promise.resolve(result);
//     }
//     const chunk = decoder.decode(value, { stream: true });
//     el.innerHTML += chunk;
//     const next = await reader.read();
//     return processText(next, el, reader, decoder);
// }

// type Extension = HtmxExtension & Record<string, any>;

// /*
// Order of htmx events:
// htmx:validateUrl
// htmx:beforeRequest
// htmx:beforeSend
// htmx:xhr:loadstart
// htmx:afterProcessNode
// htmx:load
// htmx:xhr:progress
// htmx:beforeOnLoad
// htmx:beforeSwap
// htmx:afterSwap
// htmx:afterRequest
// htmx:afterOnLoad
// htmx:xhr:loadend
// htmx:afterSettle
// */
// const extension: Extension = {
//     onEvent(name, evt) {
//         const target = evt.detail.target;
//         if (!(target instanceof HTMLElement)) return;
//         const path = evt.detail.path;
//         if (!path) return;
//         if (name === "htmx:configRequest") {
//             this.configureRequest(evt.detail);
//         }
//     },

//     configureRequest(detail: CustomEvent["detail"]) {
//         console.log("detail", detail);
//         // Cancel the default HTMX request
//         detail.cancel = true;

//         // Make a new request using the Fetch API
//     },

//     async streamResponse() {
//         const response = await fetch(endpoint, {
//             headers: {
//                 Accept: "text/html",
//             },
//         });
//         if (!response.body) throw new Error("no body");
//         const stream = response.body;
//         const decoder = new TextDecoder();
//         const reader = stream.getReader();

//         const next = await reader.read();
//         await processText(next, event.target, reader, decoder);
//     },

//     handleError(error: Error, target: HTMLElement) {
//         // Display an error message in the target element
//         console.error(error);
//         target.innerHTML = `<div class="error">Error: ${error.message}</div>`;
//     },
// };

// htmx.defineExtension("streaming", extension);
