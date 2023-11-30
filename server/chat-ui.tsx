import OpenAI from "openai";
import "./global.server";

function Layout({ children }: React.PropsWithChildren) {
    const cssFiles = buildAssets.css;
    const jsFiles = buildAssets.js;
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
        <form hx-post="/send" hx-target="this" hx-swap="outerHTML">
            <textarea
                name="message"
                placeholder="Message travvy.chat..."
                disabled={disabled}></textarea>
            <button id="submit" className="btn" disabled={disabled}>
                {disabled ? "..." : "Submit"}
            </button>
        </form>
    );
}

export function Chat({
    messages,
}: {
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
}) {
    return (
        <Layout>
            <main className="chat">
                <h1>htmx chat</h1>
                <article className="scroller">
                    <section id="messages" className="scroller-content">
                        {messages.map((message, i) => (
                            <div key={i} className="message">
                                <h4>{message.role}</h4>
                                <div className="message-content cloak">
                                    {String(message.content)}
                                </div>
                            </div>
                        ))}
                    </section>
                </article>
                <Form />
            </main>
        </Layout>
    );
}

export function FormWithMessage({ message }: { message: string }) {
    return (
        <>
            <div hx-swap-oob="beforeend:#messages">
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
            </div>
            <Form disabled={true} />
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
