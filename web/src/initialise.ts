import {
    type Scenario,
    type ScaleFactorMap,
} from "src/types";
import { fromScenarioObject } from "src/utils/scenarios";
import config from "src/data/config";

/* This function reads the reference scenario from the file specified in the
 * config file, and returns a Scenario object. The values are not scaled, so
 * this scenario should not be used for anything beyond app initialisation. */
export function setupReferenceScenarioUnscaled(): Scenario {
    // At this point we don't have a real ScaleFactorMap, so we set it to
    // `null` to avoid scaling. The ScaleFactorMap that we use for
    // everything else will be returned by this function. Likewise for the
    // validAreaNames parameter.
    return fromScenarioObject(config.referenceScenarioFile, null, null, "reference scenario");
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
    for (const layerName of config.allLayers.keys()) {
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
export function setupScenarioMap(
    scaleFactors: ScaleFactorMap,
    validAreaNames: Set<string>,
): Map<string, Scenario> {
    const allScenarioObjects = [
        config.referenceScenarioFile,
        ...config.otherScenarioFiles
    ];
    const scenarioList = allScenarioObjects.map((scenarioObject, i) => {
        return fromScenarioObject(scenarioObject, scaleFactors, validAreaNames, `scenario #${i}`);
    });
    return new Map(scenarioList.map((scenario) => [scenario.metadata.name, scenario]));
}
