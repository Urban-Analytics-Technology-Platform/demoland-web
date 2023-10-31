import { OverlayScrollbars } from "overlayscrollbars";

/* Parse a string as JSON, but returning a promise instead. The source is
 * passed as an argument to make for more informative error reporting. This
 * can, for example, be a filename. */
export function parseJsonAsPromise(source: string, json: string): Promise<object> {
    try {
        const obj = JSON.parse(json);
        return Promise.resolve(obj);
    } catch (e) {
        return Promise.reject(
            `${source} could not be parsed as valid JSON: ${e.message}`
        );
    }
}

export function overlayScrollbars(node: HTMLElement) {
    console.log(node);
    OverlayScrollbars(node, {
        overflow: {
            x: 'hidden',
        },
        scrollbars: {
            autoHide: "leave",
            autoHideDelay: 100,
            clickScroll: true,
            dragScroll: true,
        },
    });
}
