let syncWorker: Worker | undefined = undefined;
const callbacks = {};
let id = 0; // identify a Promise

async function createOrGetWorker() {
    if (syncWorker) return syncWorker;

    const SyncWorker = await import('./pyodide_worker.ts?worker');
    syncWorker = new SyncWorker.default();
    syncWorker.onmessage = (event) => {
        if (event.data.error) {
            throw new Error(event.data.error);
        }
        else {
            const { id, ...data } = event.data;
            const onSuccess = callbacks[id];
            console.log(callbacks);
            delete callbacks[id];
            onSuccess(data);
        }
    };

    return syncWorker;
}

export async function asyncRunScenario(
    script: string,
    context: object,
) {
    const worker = await createOrGetWorker();
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise((onSuccess) => {
        callbacks[id] = onSuccess;
        worker.postMessage({
            ...context,
            python: script,
            id,
        });
    });
}

// TODO convert scenario here?
export async function runScenario(scenario: string) {
    const pythonProgram = `
    import pyodide_http
    pyodide_http.patch_all() 
    print(globals())
    from js import scenario_json
    import demoland_engine
    import json
    import time
    
    start = time.time()
    scenario = json.loads(scenario_json)
    
    df = demoland_engine.get_empty()  

    for oa_code, vals in scenario["scenario_json"].items():
        df.loc[oa_code] = list(vals.values())

    pred = demoland_engine.get_indicators(df, random_seed=42)
    sig = demoland_engine.sampling.oa_key.primary_type.copy()

    mapping = {
        "Wild countryside": 0,
        "Countryside agriculture": 1,
        "Urban buffer": 2,
        "Warehouse/Park land": 3,
        "Open sprawl": 4,
        "Disconnected suburbia": 5,
        "Accessible suburbia": 6,
        "Connected residential neighbourhoods": 7,
        "Dense residential neighbourhoods": 8,
        "Gridded residential quarters": 9,
        "Dense urban neighbourhoods": 10,
        "Local urbanity": 11,
        "Regional urbanity": 12,
        "Metropolitan urbanity": 13,
        "Concentrated urbanity": 14,
        "Hyper concentrated urbanity": 15,
    }
    sig = sig.map(mapping)
    changed = df.signature_type[df.signature_type.notna()]
    sig.loc[changed.index] = changed
    pred["signature_type"] = sig
    prediction = pred.to_dict("index")
    print(f"{time.time() - start}s to run")
    json.dumps(prediction)
    `
    const result = await asyncRunScenario(pythonProgram, {
        scenario_json: scenario,
        BASE_URL: window.location.origin + window.location.pathname
    });
    if (result.error) {
        console.error(result.error);
        return result;
    }
    return JSON.parse(result.results);
}
