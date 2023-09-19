/* Generate the Map of changed OAs in a scenario, from a JSON object. */
/* Sanitise HTML input. TODO: Check if this is safe, and/or replace with a
 * proper library */
export function escapeHtml(text: string): string {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;",
    };
    return text.replace(/[&<>"'/`=]/g, (m) => map[m]);
}

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

