import { loadPyodide, type PyodideInterface } from "pyodide";

// Specify the extra properties of `globalThis`
declare global {
    interface Window {
        pyodide: PyodideInterface;
        scenario_json: string;
        model_identifier: string;
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
    await micropip.install(pathname + "demoland_engine-0.1.dev1+g3cfb7e1-py3-none-any.whl");
}

self.onmessage = async (event) => {
    // The data passed in from the main thread must contain these fields.
    // TODO: Type this properly
    const { id, python, pathname, scenario_json, model_identifier } = event.data;

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
    // model_identifier sets the DEMOLAND environment variable in the Python
    // code. That's how we can access the model identifier in the Python code.
    self.pyodide.globals.set("DEMOLAND", model_identifier);

    try {
        await self.pyodide.loadPackagesFromImports(python);
        const results = await self.pyodide.runPythonAsync(python);
        self.postMessage({ results, id });
    } catch (error) {
        self.postMessage({ error: error.message, id });
    }
};
