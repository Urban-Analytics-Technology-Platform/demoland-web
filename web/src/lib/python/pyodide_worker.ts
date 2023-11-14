import { loadPyodide } from "pyodide";

async function loadPyodideAndPackages() {
    self.pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/" });
    await self.pyodide.loadPackage(["micropip"]);
    console.log("loading micropip")
    const micropip = self.pyodide.pyimport("micropip");
    await micropip.install("lzma")
    await micropip.install("pyodide-http")
    console.log("installing demoland")
    await micropip.install('/demoland_engine-1.1.1.dev22+g17677c0.d20231106-py3-none-any.whl');
    console.log("installed demoland")
}

const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
    // make sure loading is done
    try {
        await pyodideReadyPromise;
    } catch (error) {
        console.error(error);
        self.postMessage({ error: error.message });
    }
    // Don't bother yet with this line, suppose our API is built in such a way:
    const { id, python, ...context } = event.data;
    // The worker copies the context in its own "memory" (an object mapping name to values)
    for (const key of Object.keys(context)) {
        self[key] = context[key];
    }
    // Now is the easy part, the one that is similar to working in the main thread:
    try {
        await self.pyodide.loadPackagesFromImports(python);
        const results = await self.pyodide.runPythonAsync(python);
        self.postMessage({ results, id });
    } catch (error) {
        self.postMessage({ error: error.message, id });
    }
};
