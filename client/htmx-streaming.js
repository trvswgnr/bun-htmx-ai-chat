const htmx = globalThis.htmx;
(function () {
    var api;

    htmx.defineExtension("stream", {
        init: function (apiRef) {
            api = apiRef;
            if (htmx.createStream == undefined) {
                htmx.createStream = createStream;
            }
        },

        onEvent: function (name, evt) {
            evt.preventDefault();
            if (!evt.target) throw new Error("Event has no target!");
            console.log(`event: ${name}`, evt);
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

    function createStream(url) {
        return fetch(url).then((response) => response.body.getReader());
    }

    function createStreamOnElement(elt) {
        console.log("createStreamOnElement", elt);
        if (elt == null) {
            throw new Error("createStreamOnElement called with null element");
        }

        var internalData = api.getInternalData(elt);

        var streamURL = internalData.path;
        if (streamURL == undefined) {
            return null;
        }

        htmx.createStream(streamURL)
            .then((reader) => {
                internalData.streamReader = reader;
                internalData.streamPaused = false;
                return readStream(reader, elt);
            })
            .catch((error) => {
                api.triggerErrorEvent(elt, "htmx:streamError", { error: error });
            });
    }

    function readStream(reader, elt) {
        const internalData = api.getInternalData(elt);
        if (internalData.streamPaused) {
            setTimeout(() => readStream(reader, elt), 1000);
            return;
        }

        return reader.read().then(({ done, value }) => {
            if (done) {
                api.triggerEvent(elt, "htmx:streamEnd");
                return;
            }

            var decoder = new TextDecoder();
            var html = decoder.decode(value);
            swap(elt, html);

            return readStream(reader, elt);
        });
    }

    function swap(elt, content) {
        api.withExtensions(elt, function (extension) {
            content = extension.transformResponse(content, null, elt);
        });

        var swapSpec = api.getSwapSpecification(elt);
        var target = api.getTarget(elt);
        var settleInfo = api.makeSettleInfo(elt);

        api.selectAndSwap(swapSpec.swapStyle, target, elt, content, settleInfo);

        settleInfo.elts.forEach(function (elt) {
            if (elt.classList) {
                elt.classList.add(htmx.config.settlingClass);
            }
            api.triggerEvent(elt, "htmx:beforeSettle");
        });

        if (swapSpec.settleDelay > 0) {
            setTimeout(doSettle(settleInfo), swapSpec.settleDelay);
        } else {
            doSettle(settleInfo)();
        }

        api.triggerEvent(target, "htmx:stream");
    }

    function doSettle(settleInfo) {
        return function () {
            settleInfo.tasks.forEach(function (task) {
                task.call();
            });

            settleInfo.elts.forEach(function (elt) {
                if (elt.classList) {
                    elt.classList.remove(htmx.config.settlingClass);
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
