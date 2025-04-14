import { loadPyodide, type PyodideInterface } from "pyodide";

// Specify the extra properties of `globalThis`
declare global {
    interface Window {
        pyodide: PyodideInterface;
        scenario_json: string;
        model_identifier: string;
    }
}

async function loadPyodideAndPackages(wheel_path: string) {
    self.pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
    });
    await self.pyodide.loadPackage(["micropip"]);
    const micropip = self.pyodide.pyimport("micropip");
    await micropip.install("lzma")
    await micropip.install("pyodide-http")
    try {
        await micropip.install(wheel_path);
    } catch (error) {
        // If run using npm run dev, the wheel isn't copied to the
        // /model_identifier/...whl, it's only at the root of the project.
        // This is a workaround to make it work in dev mode.
        const wheel_filename = wheel_path.split("/").slice(-1)[0];
        await micropip.install("/" + wheel_filename);
    }
}

self.onmessage = async (event) => {
    // The data passed in from the main thread must contain these fields.
    // TODO: Type this properly
    const { id, python, wheel_path, scenario_json, model_identifier } = event.data;

    // Load packages
    try {
        await loadPyodideAndPackages(wheel_path);
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
