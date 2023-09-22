import {
    type LayerName, type MacroVar,
    type ScenarioMetadata, type ScenarioChanges, type ScenarioValues,
    type Scenario,
    GLOBALMIN, GLOBALMAX
} from "src/constants";

export function rescale(layerName: LayerName, unscaledVal: number, scaleFactors: Map<LayerName, { min: number, max: number }> | null) {
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
            return GLOBALMIN + (GLOBALMAX - GLOBALMIN) * (unscaledVal - min) / (max - min);
        }
    }
}

export function unscale(layerName: LayerName, scaledVal: number, scaleFactors: Map<LayerName, { min: number, max: number }> | null) {
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
            return min + (max - min) * (scaledVal - GLOBALMIN) / (GLOBALMAX - GLOBALMIN);
        }
    }
}

/* Helper function to preprocess all raw values. Rounds to 6sf and clips
 * negative values to 0. Overly precise values lead to rounding errors and
 * spurious 'differences' in the map. */
function preprocess(num: number): number {
    return Math.max(+num.toPrecision(6), 0);
}

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
export function fromValuesObject(values: object, scaleFactors: Map<LayerName, { min: number, max: number }> | null): ScenarioValues {
    const valuesMap = new Map();
    for (const [oa, map] of Object.entries(values)) {
        valuesMap.set(oa, new Map());
        for (const [key, value] of Object.entries(map)) {
            if (value === null) {
                throw new Error("Null value in scenario");
            }
            const layerName = key as LayerName;
            valuesMap.get(oa)
                .set(layerName, rescale(layerName, preprocess(value as number), scaleFactors));
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
export function toValuesObject(values: ScenarioValues, scaleFactors: Map<LayerName, { min: number, max: number }> | null): object {
    const valuesObj = {};
    for (const [oa, m] of values.entries()) {
        valuesObj[oa] = {};
        for (const [layerName, val] of m.entries()) {
            valuesObj[oa][layerName] = unscale(layerName, val, scaleFactors);
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
export function fromScenarioObject(json: object, scaleFactors: Map<LayerName, { min: number, max: number }> | null): Scenario {
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
    const values = fromValuesObject(json.values, scaleFactors);
    return {
        metadata: metadata as ScenarioMetadata,
        changes: changes,
        values: values
    };
}

/* Convert a scenario to a regular object.
 * TODO: More precise types
 * TODO: Ensure that fromScenarioObject(toScenarioObject(scenario)) === scenario */
export function toScenarioObject(scenario: Scenario, scaleFactors: Map<LayerName, { min: number, max: number }>): object {
    return {
        metadata: scenario.metadata,
        changes: toChangesObject(scenario.changes),
        values: toValuesObject(scenario.values, scaleFactors)
    };
}
