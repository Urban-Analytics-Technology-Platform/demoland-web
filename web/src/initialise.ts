import {
    type Scenario,
    type ScaleFactorMap,
    allLayers,
} from "src/constants";
import { fromScenarioObject } from "src/utils/scenarios";
import config from "src/data/config";

/* This function reads the reference scenario from the file specified in the
 * config file, and returns a Scenario object. The values are not scaled, so
 * this scenario should not be used for anything beyond app initialisation. */
export async function setupReferenceScenarioUnscaled(): Promise<Scenario> {
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
        // At this point we don't have a real ScaleFactorMap, so we set it to
        // `null` to avoid scaling. The ScaleFactorMap that we use for
        // everything else will be returned by this function. Likewise for the
        // validAreaNames parameter.
        .then((blob) => fromScenarioObject(blob, null, null));
}

/* This function returns a set of all valid area names, as read from the
 * reference scenario. */
export function setupAreaNames(referenceScenario: Scenario): Set<string> {
    return new Set(referenceScenario.values.keys());
}

/* This function reads the values from an unscaled scenario (i.e., that returned
 * by setupReferenceScenarioUnscaled()) and returns a ScaleFactorMap which can
 * be used for scaling values. The rescale and unscale functions are defined in
 * src/utils/scenarios, and work by linearly scaling all values in the baseline
 * to lie between 0 and 100.
 */
export function setupScaleFactors(referenceScenarioUnscaled: Scenario): ScaleFactorMap {
    // Calculate current minimum and maximum values
    const scaleFactors: ScaleFactorMap = new Map();
    for (const layerName of allLayers.keys()) {
        const allValues = [];
        for (const oaValues of referenceScenarioUnscaled.values.values()) {
            allValues.push(oaValues.get(layerName));
        }
        scaleFactors.set(layerName, {
            min: Math.min(...allValues),
            max: Math.max(...allValues)
        });
    }
    return scaleFactors;
}

/* This function sets up a Map of scaled Scenarios, with the scenario names as the
 * keys. */
export async function setupScenarioMap(
    scaleFactors: ScaleFactorMap,
    validAreaNames: Set<string>,
): Promise<Map<string, Scenario>> {
    const allScenarioFiles = [
        config.referenceScenarioFile,
        ...config.otherScenarioFiles
    ];
    const scenarioList = await Promise.all(
        allScenarioFiles.map((scenarioFile) => {
            return fetch(scenarioFile)
                .then((response) => response.blob())
                .then((blob) => blob.text())
                .then((text) => JSON.parse(text))
                .catch((e) => {
                    console.error(e);
                    throw new Error(`The file '${scenarioFile}' either does not exist, or could not be parsed as valid JSON.`);
                })
                .then((obj) => fromScenarioObject(obj, scaleFactors, validAreaNames))
        })
    );
    return new Map(scenarioList.map((scenario) => [scenario.metadata.name, scenario]));
}
