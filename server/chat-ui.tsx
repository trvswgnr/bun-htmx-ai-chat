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
                {cssFiles.map((file) => (
                    <link key={file} rel="stylesheet" href={file} />
                ))}
            </head>
            <body>
                {children}
                {jsFiles.map((file) => (
                    <script key={file} src={file}></script>
                ))}
            </body>
        </html>
    );
}

function Form({ disabled }: { disabled?: boolean }) {
    return (
        <form hx-post="/send" hx-target="this" hx-swap="outerHTML">
            <input type="text" name="message" placeholder="message" />
            <button id="submit" className="btn" disabled={disabled}>
                {disabled ? "..." : "Submit"}
            </button>
        </form>
    );
}

export function Chat() {
    return (
        <Layout>
            <div>
                <h1>htmx chat</h1>
                <main className="chat">
                    <article className="scroller">
                        <section id="messages" className="scroller-content"></section>
                    </article>
                    <Form />
                </main>
            </div>
        </Layout>
    );
}

const id = 0;
export function FormWithMessage({ message }: { message: string }) {
    return (
        <>
            <div hx-swap-oob="beforeend:#messages">
                <div className="message">
                    <h6>User</h6>
                    {message}
                </div>
                <hr />
                <div className="message">
                    <h6>Bot</h6>
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

console.log("Listening on http://localhost:3000");
