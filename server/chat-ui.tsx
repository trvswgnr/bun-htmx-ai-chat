import "./global.server";
import { useContext } from "./util";

function Layout({ children }: React.PropsWithChildren) {
    const context = useContext();
    const cssFiles = context.assets.css;
    const jsFiles = context.assets.js;
    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>HTMX Chat</title>
                <script src="https://unpkg.com/htmx.org@1.9.9/dist/htmx.min.js"></script>
                <script src="https://unpkg.com/idiomorph/dist/idiomorph-ext.min.js"></script>
                <script src="https://unpkg.com/idiomorph"></script>
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/@highlightjs/cdn-assets@11.9.0/styles/base16/gruvbox-light-hard.min.css"
                />
                {cssFiles?.map((file) => <link key={file} rel="stylesheet" href={file} />)}
                {jsFiles?.map((file) => <script key={file} src={file} defer />)}
            </head>
            <body>{children}</body>
        </html>
    );
}

function Form({ disabled }: { disabled?: boolean }) {
    return (
        <>
            <form
                hx-post="/send"
                hx-target="#messages"
                hx-swap="beforeend"
                hx-on="htmx:afterRequest:this.reset()"
                hx-disabled-elt="#submit">
                <textarea name="message" placeholder="Message travvy.chat..."></textarea>
                <button id="submit" className="btn">
                    Submit
                </button>
            </form>
        </>
    );
}

export function App() {
    return (
        <Layout>
            <ChatMain />

            <form hx-ext="stream" hx-post="/test-stream" hx-swap="outerHTML">
                <input type="hidden" name="foo" value="lmaooooo" />
                <button>Test htmx</button>
            </form>
        </Layout>
    );
}

/*
The response for /test-htmx is:
    <form hx-ext="stream" hx-get="/test-htmx">
        <button>WOOOOOOOOO</button>
    </form>
*/

function ChatMain() {
    return (
        <main className="chat">
            <h1>htmx ai chat</h1>
            <article className="scroller">
                <ChatMessages />
            </article>
            <Form disabled={true} />
            <form hx-post="/clear" hx-target="#messages" hx-swap="outerHTML">
                <button id="clear" className="btn" hx-disabled-elt="this">
                    Clear chat
                </button>
            </form>
        </main>
    );
}

export function ChatMessages() {
    const messages = useContext("messagesWithHtml");
    return (
        <section id="messages" className="scroller-content">
            {messages.map((message, i) => (
                <div key={i} className="message">
                    <h4>{message.role}</h4>
                    <div
                        className="message-content"
                        dangerouslySetInnerHTML={{ __html: message.html ?? "" }}
                    />
                </div>
            ))}
            <hr />
            <div id="target"></div>
        </section>
    );
}

export function Message({ message }: { message: string }) {
    return (
        <>
            <div className="message">
                <h4>user</h4>
                <div className="message-content">{message}</div>
            </div>
            <hr />

            <div className="message-content">
                <h4>assistant</h4>
                <div
                    className="message"
                    hx-ext="stream"
                    hx-get="/message"
                    hx-swap="beforeend"
                    hx-trigger="load"></div>
            </div>
        </>
    );
}

export function Test() {
    return (
        <Layout>
            <div
                style={{ minHeight: "100px" }}
                id="content"
                hx-ext="stream"
                hx-get="/test"
                hx-swap="beforeend"
                hx-trigger="click"></div>
            <button id="pause">Pause</button>
            <button id="resume">Resume</button>
        </Layout>
    );
}

/**
 * This component is used to stream content from the server to the client
 * with server sent events.
 */
function StreamingContent({
    children,
    endpoint,
}: React.PropsWithChildren<{ endpoint: ValidEndpoint }>) {
    return <streaming-content endpoint={endpoint}>{children}</streaming-content>;
}
