import {
    type LayerName,
    type Scenario,
    allLayers,
} from "src/constants";
import { fromScenarioObject } from "src/utils/scenarios";
import config from "src/data/config";

/* This function reads the values from an unscaled Values map and returns a pair
 * of functions, one for scaling and one for unscaling.
 *
 * The rescaling is done by linearly interpolating between the global minimum
 * and maximum value for each indicator as found in the baseline.
 */
export async function setupScaleFactors(): (Promise<Map<LayerName, { min: number, max: number }>>) {
    // Read in the reference scenario (without scaling)
    // TODO: Remove circular reference to fromScenarioObject (?)
    const referenceScenario: Scenario = await fetch(config.referenceScenarioFile)
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
        .then((blob) => fromScenarioObject(blob, null))

    // Calculate current minimum and maximum values
    const scaleFactors: Map<LayerName, { min: number, max: number }> = new Map();
    for (const layerName of allLayers.keys()) {
        const allValues = [];
        for (const oaValues of referenceScenario.values.values()) {
            allValues.push(oaValues.get(layerName));
        }
        scaleFactors.set(layerName, {
            min: Math.min(...allValues),
            max: Math.max(...allValues)
        });
    }
    return scaleFactors;
}

/* Add in all the scenarios */
const allScenarioFiles = [
    config.referenceScenarioFile,
    ...config.otherScenarioFiles
];

export async function setupScenarioMap(scaleFactors: Map<LayerName, { min: number, max: number }>): Promise<Map<string, Scenario>> {
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
                .then((obj) => fromScenarioObject(obj, scaleFactors))
        })
    );
    return new Map(scenarioList.map((scenario) => [scenario.metadata.name, scenario]));
}
