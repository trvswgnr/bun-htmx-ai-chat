var api;
htmx.defineExtension("stream", {
    init(apiRef) {
        api = apiRef;
    },
    transformResponse(_, xhr, elt) {
        if (!elt.seenBytes) {
            elt.seenBytes = 0;
        }
        return xhr.responseText.slice(elt.seenBytes);
    },
    onEvent(name, evt) {
        if (name === "htmx:beforeRequest") {
            var detail = evt.detail;
            var xhr = detail.xhr;
            var onloadHandler = xhr.onload.bind(xhr);
            var elt = detail.elt;
            xhr.onload = null;
            elt.seenBytes = 0;
            xhr.onreadystatechange = function (ev) {
                if (xhr.readyState === 3) {
                    const progressEvent = new ProgressEvent("ext:stream:chunk", {
                        ...ev,
                        lengthComputable: false,
                        loaded: xhr.responseText.length,
                        total: xhr.responseText.length,
                    });
                    onloadHandler(progressEvent);
                    elt.seenBytes = xhr.responseText.length;
                }
            };
        }
    },
});
