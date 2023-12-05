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
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/@highlightjs/cdn-assets@11.9.0/styles/base16/gruvbox-light-hard.min.css"
                />
                {cssFiles.map((file) => (
                    <link key={file} rel="stylesheet" href={file} />
                ))}
                <script
                    src="https://unpkg.com/@highlightjs/cdn-assets@11.9.0/highlight.min.js"
                    defer></script>
                <script src="https://unpkg.com/showdown/dist/showdown.min.js" defer></script>
                {jsFiles.map((file) => (
                    <script key={file} src={file} defer></script>
                ))}
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
            <form hx-post="/clear" hx-target="#messages" hx-swap="outerHTML">
                <button id="clear" className="btn" hx-disabled-elt="this">
                    Clear chat
                </button>
            </form>
        </Layout>
    );
}

export function ChatMain() {
    return (
        <main className="chat">
            <h1>htmx chat</h1>
            <article className="scroller">
                <ChatMessages />
            </article>
            <Form disabled={true} />
        </main>
    );
}

export function ChatMessages() {
    const context = useContext();
    const messages = context.messages;
    return (
        <section id="messages" className="scroller-content">
            {messages.map((message, i) => (
                <div key={i} className="message">
                    <h4>{message.role}</h4>
                    <div className="message-content cloak">{String(message.content)}</div>
                </div>
            ))}
        </section>
    );
}

export function Message({ message }: { message: string }) {
    return (
        <>
            <div className="message">
                <h4>User</h4>
                {message}
            </div>
            <hr />
            <div className="message">
                <h4>Bot</h4>
                <StreamingContent endpoint="/message" />
            </div>
            <hr />
        </>
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
