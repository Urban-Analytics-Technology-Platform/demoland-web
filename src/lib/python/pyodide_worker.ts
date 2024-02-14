import { loadPyodide, type PyodideInterface } from "pyodide";

// Specify the extra properties of `globalThis`
declare global {
    interface Window {
        pyodide: PyodideInterface;
        scenario_json: string;
        BASE_URL: string;
    }
}

async function loadPyodideAndPackages(pathname: string) {
    self.pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
    });
    await self.pyodide.loadPackage(["micropip"]);
    const micropip = self.pyodide.pyimport("micropip");
    await micropip.install("lzma")
    await micropip.install("pyodide-http")
    await micropip.install(pathname + "demoland_engine-0.1.dev1+g7d1db02-py3-none-any.whl");
}

self.onmessage = async (event) => {
    // The data passed in from the main thread must contain these fields.
    // TODO: Type this properly
    const { id, python, pathname, scenario_json, BASE_URL } = event.data;

    // Load packages
    try {
        await loadPyodideAndPackages(pathname);
    } catch (error) {
        console.error(error);
        self.postMessage({ error: error.message });
    }

    // Setting this property on `self` allows us to pass in variables from
    // the main thread to the worker thread, and access them in Python code.
    // So, on the TypeScript side (pyodide.ts) we can do `from js import
    // scenario_json`.
    self.scenario_json = scenario_json;
    // The BASE_URL is more tricky because it must be accessed from the Python
    // package itself. We need to set this as a global variable here, which lets
    // us do `import pyodide_js; pyodide_js.globals.get("BASE_URL")` (in the
    // `cache.py` file).
    self.pyodide.globals.set("BASE_URL", BASE_URL);

    try {
        await self.pyodide.loadPackagesFromImports(python);
        const results = await self.pyodide.runPythonAsync(python);
        self.postMessage({ results, id });
    } catch (error) {
        self.postMessage({ error: error.message, id });
    }
};
