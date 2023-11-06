// webworker.js

// Setup your project to serve `py-worker.js`. You should also serve
// `pyodide.js`, and all its associated `.asm.js`, `.json`,
// and `.wasm` files as well:
import { loadPyodide } from "pyodide"

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/" });
  await self.pyodide.loadPackage(["micropip"]);
  console.log("loading micro pip")
  const micropip = pyodide.pyimport("micropip");
  await micropip.install("lzma")
  await micropip.install("pyodide-http")

  console.log("installing demoland")
  await micropip.install('http://localhost:5173/demoland_engine-1.1.1.dev22+g17677c0.d20231103-py3-none-any.whl');

  console.log("installed demoland")
}

let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  // make sure loading is done
  try {
    await pyodideReadyPromise;
  } catch (error) {
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
    let results = await self.pyodide.runPythonAsync(python);
    self.postMessage({ results, id });
  } catch (error) {
    self.postMessage({ error: error.message, id });
  }
};
