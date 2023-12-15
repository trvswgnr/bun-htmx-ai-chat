// @ts-check

/** @typedef {import("htmx.org").HtmxInternalApi} HtmxInternalApi */

(function () {
    /** @type {HtmxInternalApi} */
    var api;

    htmx.defineExtension("stream", {
        init: function (apiRef) {
            api = apiRef;
            if (htmx.createStream === undefined) {
                htmx.createStream = createStream;
            }
        },

        onEvent: function (name, evt) {
            evt.preventDefault();
            if (!(evt.target instanceof HTMLElement)) throw new Error("event has no target!");
            var internalData = api.getInternalData(evt.target);
            switch (name) {
                case "htmx:beforeCleanupElement": {
                    if (internalData.streamReader) {
                        internalData.streamReader.cancel();
                    }
                    break;
                }
                case "htmx:confirm": {
                    createStreamOnElement(evt.target);
                    break;
                }
            }
        },
    });

    /** @param {string} url */
    async function createStream(url) {
        try {
            const response = await fetch(url);
            if (!response.body) {
                throw new Error("Response has no body");
            }
            return response.body.getReader();
        } catch (error) {
            return await Promise.reject(error);
        }
    }

    /** @param {HTMLElement?} elt */
    async function createStreamOnElement(elt) {
        console.log("createStreamOnElement", elt);
        if (elt === null) {
            throw new Error("createStreamOnElement called with null element");
        }

        var internalData = api.getInternalData(elt);

        var streamURL = internalData.path;
        if (streamURL === undefined) {
            return Promise.reject(new Error("No path defined for element"));
        }

        try {
            const reader = await htmx.createStream(streamURL);
            internalData.streamReader = reader;
            internalData.streamPaused = false;
            return await readStream(reader, elt);
        } catch (error) {
            api.triggerErrorEvent(elt, "htmx:streamError", { error: error });
        }
    }

    /**
     * @param {ReadableStreamDefaultReader<Uint8Array>} reader
     * @param {HTMLElement} elt
     * @returns {Promise<void>}
     */
    async function readStream(reader, elt) {
        const internalData = api.getInternalData(elt);
        if (internalData.streamPaused) {
            setTimeout(() => readStream(reader, elt), 1000);
            return Promise.resolve();
        }

        const { done, value: value_1 } = await reader.read();
        if (done) {
            api.triggerEvent(elt, "htmx:streamEnd");
            return;
        }
        var decoder = new TextDecoder();
        var html = decoder.decode(value_1);
        swap(elt, html);
        return readStream(reader, elt);
    }

    /**
     * @param {HTMLElement} elt
     * @param {string} content
     * @returns {void}
     */
    function swap(elt, content) {
        // api.withExtensions(elt, function (extension) {
        //     if (!extension.transformResponse) return;
        //     const xhr = api.getInternalData(elt).xhr ?? new XMLHttpRequest();
        //     content = extension.transformResponse(content, xhr, elt);
        // });

        // var swapSpec = api.getSwapSpecification(elt);
        var target = api.getTarget(elt);
        if (target === null) {
            throw new Error("No target found for element");
        }
        target.innerHTML += content;
        // var settleInfo = api.makeSettleInfo(elt);

        // api.selectAndSwap(swapSpec.swapStyle, target, elt, content, settleInfo);

        // settleInfo.elts?.forEach(function (elt) {
        //     if (elt.classList) {
        //         elt.classList.add(htmx.config.settlingClass || "");
        //     }
        //     api.triggerEvent(elt, "htmx:beforeSettle");
        // });

        // if (swapSpec.settleDelay > 0) {
        //     setTimeout(doSettle(settleInfo), swapSpec.settleDelay);
        // } else {
        //     doSettle(settleInfo)();
        // }

        api.triggerEvent(target, "htmx:stream", { elt: elt, content: content });
    }

    /** @param {import("htmx.org").HtmxSettleInfo} settleInfo */
    function doSettle(settleInfo) {
        return function () {
            settleInfo.tasks?.forEach(function (task) {
                task.call(undefined);
            });

            settleInfo.elts?.forEach(function (elt) {
                if (elt.classList) {
                    elt.classList.remove(htmx.config.settlingClass || "");
                }
                api.triggerEvent(elt, "htmx:afterSettle");
            });
        };
    }

    htmx.pauseStream = function (elt) {
        var internalData = api.getInternalData(elt);
        if (internalData.streamReader) {
            internalData.streamPaused = true;
        }
    };

    htmx.resumeStream = function (elt) {
        var internalData = api.getInternalData(elt);
        if (internalData.streamReader) {
            internalData.streamPaused = false;
        }
    };
})();
