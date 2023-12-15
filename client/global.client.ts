import "~/global.shared";
import type HTMX from "htmx.org";

declare global {
    var showdown: any;
    var hljs: any;
    var htmx: typeof HTMX;
}
