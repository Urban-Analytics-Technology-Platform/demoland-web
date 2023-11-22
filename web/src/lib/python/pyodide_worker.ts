import { loadPyodide, type PyodideInterface } from "pyodide";

// Specify the extra properties of `globalThis`
declare global {
    interface Window {
        pyodide: PyodideInterface;
        scenario_json: string;
        BASE_URL: string;
    }
}

async function loadPyodideAndPackages() {
    self.pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
    });
    await self.pyodide.loadPackage(["micropip"]);
    const micropip = self.pyodide.pyimport("micropip");
    await micropip.install("lzma")
    await micropip.install("pyodide-http")
    await micropip.install(window.location.pathname + "demoland_engine-0.1.dev1+gcccf10a-py3-none-any.whl");
}

self.onmessage = async (event) => {
    // Load packages
    try {
        await loadPyodideAndPackages();
    } catch (error) {
        console.error(error);
        self.postMessage({ error: error.message });
    }
    const { id, python, ...context } = event.data;

    // The 'context' allows us to pass in variables from the main thread
    // to the worker thread, and access them in Python code. On the TypeScript
    // side we can do `from js import scenario_json`; and in the Python package
    // itself we can do `import pyodide_js; pyodide_js.globals.get("BASE_URL")`.
    self.scenario_json = context.scenario_json;
    self.BASE_URL = context.BASE_URL;

    try {
        await self.pyodide.loadPackagesFromImports(python);
        const results = await self.pyodide.runPythonAsync(python);
        self.postMessage({ results, id });
    } catch (error) {
        self.postMessage({ error: error.message, id });
    }
};
