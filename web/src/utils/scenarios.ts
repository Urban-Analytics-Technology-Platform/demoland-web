import { writable, type Writable } from 'svelte/store';
import {
    type LayerName, type MacroVar, type Scenario as ConstantScenario,
    allLayers, GLOBALMIN, GLOBALMAX
} from "src/constants";
import config from "src/data/config";

import JSZip from "jszip";
import { parseJsonAsPromise, escapeHtml } from "src/utils";

export type Metadata = {
    name: string;
    short: string;
    long: string;
    description: string;
};
export type Changes = Map<string, Map<MacroVar, number | null>>;
export type Values = Map<string, Map<LayerName, number>>;
export type Scenario = ConstantScenario;
// TODO: make Scenario a product of these three types

export function createChangesMap(changed: object): Changes {
    const changesMap = new Map();
    // Loop over OAs
    for (const [oa, map] of Object.entries(changed)) {
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

/* Generate the Map of output values in a scenario, from a JSON object.
 * The `scale` parameter indicates whether the values should be scaled. */
export function createValuesMap(values: object, scale: boolean): Values {
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

/* Generate a scenario from a zip file. */
export function createScenarioFromZip(zip: JSZip, scale: boolean): Promise<Scenario> {
    function getContentsFromZip(
        zip: JSZip
    ): Promise<[object, object, object]> {
        // Correctly handle folders which were manually compressed. These
        // have one extra level (for example, inside x.zip will be a folder
        // called x).
        if (zip.file("changed.json") === null) {
            const directories = zip.folder(/./);
            if (directories.length === 1) {
                zip = zip.folder(directories[0].name);
            }
        }
        // Parse a file
        function parseOneFile(fname: string): Promise<object> {
            const file = zip.file(fname);
            return file === null
                ? Promise.reject(`The ${fname} file is missing.`)
                : file
                    .async("string")
                    .then((file) => parseJsonAsPromise(fname, file));
        }
        return Promise.all([
            parseOneFile("metadata.json"),
            parseOneFile("changed.json"),
            parseOneFile("values.json"),
        ]);
    }

    /* Check that the actual JSON contents of the files match the expected
     * format. */
    function validateZipContents(
        scenarioData: [object, object, object]
    ): Promise<[Metadata, Changes, Values]> {
        const metadata = scenarioData[0];
        const changed = scenarioData[1];
        const values = scenarioData[2];
        // Check metadata
        for (const field of ["name", "short", "long", "description"]) {
            if (!Object.hasOwn(metadata, field)) {
                return Promise.reject(
                    `The metadata.json file is missing the ${field} field.`
                );
            }
            if (typeof metadata[field] !== "string") {
                return Promise.reject(
                    `The ${field} field in metadata.json is not a string.`
                );
            }
        }
        // TODO Validate changed and values.
        const changedMap = createChangesMap(changed);
        const valuesMap = createValuesMap(values, scale);
        return Promise.resolve([
            metadata as Metadata,
            changedMap,
            valuesMap,
        ]);
    }

    function createScenario(
        scenarioData: [Metadata, Changes, Values]
    ): Scenario {
        const newScenario: Scenario = {
            name: escapeHtml(scenarioData[0].name),
            short: escapeHtml(scenarioData[0].short),
            long: escapeHtml(scenarioData[0].long),
            description: escapeHtml(scenarioData[0].description).replace(/\r/g, "").split(/\n+/),
            changed: scenarioData[1],
            values: scenarioData[2]
        };
        return newScenario;
    }

    return getContentsFromZip(zip)
        .then(validateZipContents)
        .then(createScenario)
        .catch((e) => {
            console.error(e);
            return Promise.reject("An error occurred while parsing the scenario.");
        })
}

/* Read in the reference scenario (without scaling) */
function readReferenceScenario(): Promise<Scenario> {
    return fetch(config.referenceScenarioFile)
        .then((response) => response.blob())
        .catch((e) => {
            console.error(e);
            return Promise.reject(`Could not read reference scenario from ${config.referenceScenarioFile}.`);
        })
        .then(JSZip.loadAsync)
        .then((blob) => createScenarioFromZip(blob, false))
}

const referenceScenario = await readReferenceScenario();

/* This function reads the values from an unscaled Values map and returns a pair
 * of functions, one for scaling and one for unscaling.
 *
 * The rescaling is done by linearly interpolating between the global minimum
 * and maximum value for each indicator as found in the baseline.
 */
function getScaleFunctions(unscaledReferenceVals: Values): ((layerName: LayerName, val: number) => number)[] {
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
                .catch((e) => {
                    console.error(e);
                    return Promise.reject(`Could not read scenario from ${scenarioFile}.`);
                })
                .then(JSZip.loadAsync)
                .then((zip) => createScenarioFromZip(zip, true))
        })
    );
    return new Map(scenarioList.map((scenario) => [scenario.name, scenario]));
}
const allScenariosMap = await setupScenarioMap();
export const allScenarios: Writable<Map<string, Scenario>> = writable(allScenariosMap);
export const scenarioName: Writable<string> = writable(allScenariosMap.keys().next().value);
export const compareScenarioName: Writable<string | null> = writable(null);
export function getScenario(name: string): Scenario {
    return allScenariosMap.get(name);
}
