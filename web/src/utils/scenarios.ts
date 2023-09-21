import { writable, type Writable } from 'svelte/store';
import {
    type LayerName, type MacroVar,
    type ScenarioMetadata, type ScenarioChanges, type ScenarioValues,
    type Scenario,
    allLayers, GLOBALMIN, GLOBALMAX
} from "src/constants";
import config from "src/data/config";

import JSZip from "jszip";
import { parseJsonAsPromise } from "src/utils";


/* Generate the Map of input changes for a scenario, from a regular object. */
export function fromChangesObject(changes: object): ScenarioChanges {
    const changesMap = new Map();
    // Loop over OAs
    for (const [oa, map] of Object.entries(changes)) {
        changesMap.set(oa, new Map());
        // Loop over macrovariables
        for (const [key, value] of Object.entries(map)) {
            changesMap
                .get(oa)
                .set(key as MacroVar, value as number);
        }
    }
    return changesMap;
}

/* Generate the Map of output values in a scenario, from a regular object.
 * The `scale` parameter indicates whether the values should be scaled. */
export function fromValuesObject(values: object, scale: boolean): ScenarioValues {
    const valuesMap = new Map();
    for (const [oa, map] of Object.entries(values)) {
        valuesMap.set(oa, new Map());
        for (const [key, value] of Object.entries(map)) {
            if (value === null) {
                throw new Error("Null value in scenario");
            }
            const layerName = key as LayerName;
            if (scale) {
                valuesMap.get(oa)
                    .set(layerName, rescale(layerName, value as number));
            } else {
                valuesMap.get(oa)
                    .set(layerName, value);
            }
        }
    }
    return valuesMap;
}

/* Convert a ScenarioChanges map into a regular object.
 * TODO: precise object typing */
export function toChangesObject(changes: ScenarioChanges): object {
    const changesObj = {};
    for (const [oa, m] of changes.entries()) {
        changesObj[oa] = {};
        for (const [mv, v] of m.entries()) {
            changesObj[oa][mv] = v;
        }
    }
    return changesObj;
}

/* Convert a ScenarioValues map into a regular object.
 * TODO: precise object typing */
export function toValuesObject(values: ScenarioValues): object {
    const valuesObj = {};
    for (const [oa, m] of values.entries()) {
        valuesObj[oa] = {};
        for (const [layerName, val] of m.entries()) {
            valuesObj[oa][layerName] = unscale(layerName, val);
        }
    }
    return valuesObj;
}

/* Read in a scenario from a JSON file.
 * The JSON file must be an object with three keys:
 *    - metadata: an object with the keys name, short, long, description
 *    - changes: an object which can be parsed by createChangesMap
 *    - values: an object which can be parsed by createValuesMap
 * The `scale` parameter indicates whether the values should be scaled.
 * The function throws an error if the JSON is invalid in any way.
 * TODO: More precise types for the JSON object */
export function fromScenarioObject(json: object, scale: boolean): Scenario {
    // Validation: check top-level keys
    for (const field of ["metadata", "changes", "values"]) {
        if (!Object.hasOwn(json, field)) {
            throw new Error(`The scenario JSON file does not have a '${field}' field.`);
        }
        if (typeof json[field] !== "object") {
            throw new Error(`The ${field} field in the scenario JSON file is not an object.`);
        }
    }
    // Validation: check metadata keys
    for (const field of ["name", "short", "long", "description"]) {
        if (!Object.hasOwn(json.metadata, field)) {
            throw new Error(
                `The scenario JSON file does not have a 'metadata.${field}' key.`
            );
        }
        if (typeof json.metadata[field] !== "string") {
            throw new Error(
                `The 'metadata.${field}' key in the scenario JSON file is not a string.`
            );
        }
    }

    // TODO: Validation: check changes and values

    // Parsing
    const metadata = json.metadata;
    const changes = fromChangesObject(json.changes);
    const values = fromValuesObject(json.values, scale);
    return {
        metadata: metadata as ScenarioMetadata,
        changes: changes,
        values: values
    };
}

/* Convert a scenario to a regular object.
 * TODO: More precise types
 * TODO: Ensure that fromScenarioObject(toScenarioObject(scenario)) === scenario */
export function toScenarioObject(scenario: Scenario): object {
    return {
        metadata: scenario.metadata,
        changes: toChangesObject(scenario.changes),
        values: toValuesObject(scenario.values)
    };
}

/* Read in the reference scenario (without scaling) */
async function readReferenceScenario(): Promise<Scenario> {
    return fetch(config.referenceScenarioFile)
        .then((response) => response.blob())
        .then((blob) => blob.text())
        .catch((e) => {
            console.error(e);
            throw new Error(`Could not read reference scenario from the file '${config.referenceScenarioFile}'. Does the file exist?`);
        })
        .then((text) => JSON.parse(text))
        .catch((e) => {
            console.error(e);
            throw new Error(`Could not parse '${config.referenceScenarioFile}' as a valid JSON file.`);
        })
        .then((blob) => fromScenarioObject(blob, false))
}

const referenceScenario = await readReferenceScenario();

/* This function reads the values from an unscaled Values map and returns a pair
 * of functions, one for scaling and one for unscaling.
 *
 * The rescaling is done by linearly interpolating between the global minimum
 * and maximum value for each indicator as found in the baseline.
 */
function getScaleFunctions(unscaledReferenceVals: ScenarioValues): ((layerName: LayerName, val: number) => number)[] {
    // Helper function to preprocess all raw values. Rounds to 6sf and clips
    // negative values to 0. Overly precise values lead to rounding errors and
    // spurious 'differences' in the map.
    function preprocess(num: number): number {
        return Math.max(+num.toPrecision(6), 0);
    }
    // Calculate current minimum and maximum values
    const minValues: Map<LayerName, number> = new Map();
    const maxValues: Map<LayerName, number> = new Map();
    for (const layerName of allLayers.keys()) {
        const allValues = [];
        for (const oaValues of unscaledReferenceVals.values()) {
            allValues.push(preprocess(oaValues.get(layerName)));
        }
        minValues.set(layerName, Math.min(...allValues));
        maxValues.set(layerName, Math.max(...allValues));
    }
    function rescale(layerName: LayerName, unscaledVal: number) {
        // Do NOT scale signature types - categorical variable
        if (layerName === "signature_type") {
            return unscaledVal;
        }
        else {
            const val = preprocess(unscaledVal);
            const min = minValues.get(layerName);
            const max = maxValues.get(layerName);
            return GLOBALMIN + (GLOBALMAX - GLOBALMIN) * (val - min) / (max - min);
        }
    }
    function unscale(layerName: LayerName, scaledVal: number) {
        if (layerName === "signature_type") {
            return scaledVal;
        }
        else {
            const min = minValues.get(layerName);
            const max = maxValues.get(layerName);
            return min + (max - min) * (scaledVal - GLOBALMIN) / (GLOBALMAX - GLOBALMIN);
        }
    }
    return [rescale, unscale];
}

const scaleFunctions = getScaleFunctions(referenceScenario.values);
export const rescale = scaleFunctions[0];
export const unscale = scaleFunctions[1];

/* Add in all the scenarios */
const allScenarioFiles = [
    config.referenceScenarioFile,
    ...config.otherScenarioFiles
];
async function setupScenarioMap(): Promise<Map<string, Scenario>> {
    const scenarioList = await Promise.all(
        allScenarioFiles.map((scenarioFile) => {
            return fetch(scenarioFile)
                .then((response) => response.blob())
                .then((blob) => blob.text())
                .catch((e) => {
                    console.error(e);
                    throw new Error(`Could not read scenario from the file '${scenarioFile}'. Does the file exist?`);
                })
                .then((text) => JSON.parse(text))
                .catch((e) => {
                    console.error(e);
                    throw new Error(`Could not parse '${scenarioFile}' as a valid JSON file.`);
                })
                .then((obj) => fromScenarioObject(obj, true))
        })
    );
    return new Map(scenarioList.map((scenario) => [scenario.metadata.name, scenario]));
}
const allScenariosMap = await setupScenarioMap();
console.log(`Loaded ${allScenariosMap.size} scenarios with names: ${Array.from(allScenariosMap.keys()).join(", ")}`);
export const allScenarios: Writable<Map<string, Scenario>> = writable(allScenariosMap);
export const scenarioName: Writable<string> = writable(allScenariosMap.keys().next().value);
export const compareScenarioName: Writable<string | null> = writable(null);
export function getScenario(name: string): Scenario {
    return allScenariosMap.get(name);
}
