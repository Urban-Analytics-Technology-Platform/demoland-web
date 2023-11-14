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

export async function asyncRun(script, context) {
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

export async function runScenario(scenario) {
    const pythonProgram = `
    import pyodide_http
    pyodide_http.patch_all() 
    from js import scenario_json
    import sys
    import demoland_engine
    import json
    import pandas as pd 
    import numpy as np
    import joblib
    import sklearn
    import time
    
    start= time.time()
    print(scenario_json)
    scenario = json.loads(scenario_json)
    print(json.dumps(scenario, indent=2))
    
    df = demoland_engine.get_empty()  
    print("Got empty")

    for oa_code, vals in scenario["scenario_json"].items():
        print(oa_code, list(vals.values()))
        df.loc[oa_code] = list(vals.values())

    print("setup codes")
    
    pred = demoland_engine.get_indicators(df, random_seed=42)
    print("made prediction")
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
    print(f"{time.time()- start} s to run")
    json.dumps(prediction)
    `
    const result = await asyncRun(pythonProgram, { scenario_json: scenario })
    if (result.error) {
        console.error(result.error);
        return result;
    }
    return JSON.parse(result.results);
}
