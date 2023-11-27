import {
    type LayerName, type MacroVar,
    type ScenarioMetadata,
    type ScenarioChanges, type ScenarioValues, type Scenario,
    type ChangesObject, type ValuesObject, type ScenarioObject,
    type ScaleFactorMap,
    config
} from "src/data/config";

export function rescale(
    layerName: LayerName,
    unscaledVal: number,
    scaleFactors: ScaleFactorMap | null
): number {
    // TODO: define layer type and specify whether categorical or not
    if (layerName === "signature_type") {
        return unscaledVal;
    }
    else {
        if (scaleFactors === null) {
            return unscaledVal;
        } else {
            const min = scaleFactors.get(layerName).min;
            const max = scaleFactors.get(layerName).max;
            return config.scale.min + (config.scale.max - config.scale.min) * (unscaledVal - min) / (max - min);
        }
    }
}

export function unscale(
    layerName: LayerName,
    scaledVal: number,
    scaleFactors: ScaleFactorMap | null
): number {
    // TODO: define layer type and specify whether categorical or not
    if (layerName === "signature_type") {
        return scaledVal;
    }
    else {
        if (scaleFactors === null) {
            return scaledVal;
        } else {
            const min = scaleFactors.get(layerName).min;
            const max = scaleFactors.get(layerName).max;
            return min + (max - min) * (scaledVal - config.scale.min) / (config.scale.max - config.scale.min);
        }
    }
}

/* Helper function to preprocess all raw values. Rounds to 6sf and clips
 * negative values to 0. Overly precise values lead to rounding errors and
 * spurious 'differences' in the map. */
function preprocess(num: number): number {
    return Math.max(+num.toPrecision(6), 0);
}

/* Convenience function to append a source string to an error message. */
function appendSource(s: string | null): string {
    return s === null ? "" : ` (from '${s}')`;
}

/* Generate the Map of input changes for a scenario, from a regular object. */
function fromChangesObject(
    changes: object,
    validAreaNames: Set<string> | null,
    source: string | null,
): ScenarioChanges {
    const src = appendSource(source);
    const changesMap = new Map();
    // Loop over OAs
    for (const [oa, map] of Object.entries(changes)) {
        if (validAreaNames !== null && !validAreaNames.has(oa)) {
            throw new Error(`Invalid OA '${oa}' found in scenario changes.${src}`);
        }
        else {
            changesMap.set(oa, new Map());
            // Loop over macrovariables
            for (const [key, value] of Object.entries(map)) {
                changesMap
                    .get(oa)
                    .set(key as MacroVar, value as number);
            }
        }
    }
    return changesMap;
}

/* Generate the Map of output values in a scenario, from a regular object.
 * The `scale` parameter indicates whether the values should be scaled. */
function fromValuesObject(
    values: object,
    scaleFactors: ScaleFactorMap | null,
    validAreaNames: Set<string> | null,
    source: string | null,
): ScenarioValues {
    const src = appendSource(source);
    const valuesMap = new Map();
    const foundAreaNames = new Set();
    for (const [oa, map] of Object.entries(values)) {
        if (validAreaNames !== null && !validAreaNames.has(oa)) {
            throw new Error(`Invalid OA '${oa}' found in scenario values.${src}`);
        }
        else {
            valuesMap.set(oa, new Map());
            foundAreaNames.add(oa);
            for (const [key, value] of Object.entries(map)) {
                const layerName = key as LayerName;
                if (config.allLayers.has(layerName)) {
                    if (value === null) {
                        throw new Error(`Null value found in scenario values for OA '${oa}'.${src}`);
                    }
                    valuesMap.get(oa)
                        .set(layerName, rescale(layerName, preprocess(value as number), scaleFactors));
                }
            }
        }
    }
    // Check that all valid OAs are present
    if (validAreaNames !== null) {
        for (const oa of validAreaNames) {
            if (!foundAreaNames.has(oa)) {
                throw new Error(`OA '${oa}' not found in scenario values.${src}`);
            }
        }
    }
    return valuesMap;
}

/* Convert a ScenarioChanges map into a regular object. */
export function toChangesObject(
    changes: ScenarioChanges
): ChangesObject {
    const changesObj = {};
    for (const [oa, m] of changes.entries()) {
        changesObj[oa] = {};
        for (const [mv, v] of m.entries()) {
            changesObj[oa][mv] = v;
        }
    }
    return changesObj;
}

/* Convert a ScenarioValues map into a regular object. */
function toValuesObject(
    values: ScenarioValues,
    scaleFactors: ScaleFactorMap | null,
): ValuesObject {
    const valuesObj = {};
    for (const [oa, m] of values.entries()) {
        valuesObj[oa] = {};
        for (const [ln, val] of m.entries()) {
            valuesObj[oa][ln] = unscale(ln, val, scaleFactors);
        }
    }
    return valuesObj;
}

/* Parse a JSON object into a Scenario.
 *
 * The JSON object must obey the schema set out in (TODO).
 *
 * @param {ScenarioObject} json The JSON object to parse.
 * @param {ScaleFactorMap | null} scaleFactors The scale factors for each layer
 * (see the `setupScaleFactors` function), or null if no scaling is to be
 * performed.
 * @param {Set<string> | null} validAreaNames A set of valid OA names, or null
 * if no validation is to be performed. If the scenario changes or values have
 * any keys that are not in this set, an error will be thrown.
 * @param {string | null} source A string describing the source of the JSON
 * object, or null if no source is to be specified. This is used for more
 * informative error messages.
 * @returns {Scenario} A Scenario object.
 */
export function fromScenarioObject(
    json: ScenarioObject,
    scaleFactors: ScaleFactorMap | null,
    validAreaNames: Set<string> | null,
    source: string | null,
): Scenario {
    const src = appendSource(source);
    // Validation: check top-level keys
    for (const field of ["metadata", "changes", "values"]) {
        if (!Object.hasOwn(json, field)) {
            throw new Error(`The scenario JSON file does not have a '${field}' field.${src}`);
        }
        if (typeof json[field] !== "object") {
            throw new Error(`The ${field} field in the scenario JSON file is not an object.${src}`);
        }
    }
    // Validation: check metadata keys
    for (const field of ["name", "short", "long", "description"]) {
        if (!Object.hasOwn(json.metadata, field)) {
            throw new Error(
                `The scenario JSON file does not have a 'metadata.${field}' key.${src}`
            );
        }
        if (typeof json.metadata[field] !== "string") {
            throw new Error(
                `The 'metadata.${field}' key in the scenario JSON file is not a string.${src}`
            );
        }
    }

    // Parsing
    const metadata = json.metadata;
    const changes = fromChangesObject(json.changes, validAreaNames, source);
    const values = fromValuesObject(json.values, scaleFactors, validAreaNames,
        source);
    return {
        metadata: metadata,
        changes: changes,
        values: values
    };
}

/* Convert a scenario to a regular object.
 * TODO: Ensure that fromScenarioObject(toScenarioObject(scenario)) === scenario */
export function toScenarioObject(
    scenario: Scenario,
    scaleFactors: ScaleFactorMap
): ScenarioObject {
    return {
        metadata: scenario.metadata,
        changes: toChangesObject(scenario.changes),
        values: toValuesObject(scenario.values, scaleFactors)
    };
}

export function copyScenario(
    scenario: Scenario,
): Scenario {
    const metadata = {
        name: scenario.metadata.name,
        short: scenario.metadata.short,
        long: scenario.metadata.long,
        description: scenario.metadata.description
    }
    const changes = new Map();
    for (const [oa, oaMap] of scenario.changes.entries()) {
        changes.set(oa, new Map(oaMap));
    }
    const values = new Map();
    for (const [oa, oaMap] of scenario.values.entries()) {
        values.set(oa, new Map(oaMap));
    }
    return { metadata, changes, values };
}
