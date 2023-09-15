import { type Scenario, type MacroVar, type LayerName } from "src/constants";
import { rescale } from "src/scenarios";

export type Metadata = {
    name: string;
    short: string;
    long: string;
    description: string;
};
export type Changes = Map<string, Map<MacroVar, number | null>>;
export type Values = Map<string, Map<LayerName, number>>;

// Helper functions to load / save changes from localStorage
export function getLocalChanges(): Changes {
    const stringified = localStorage.getItem("changed");
    if (stringified === null) {
        return new Map();
    } else {
        const intermediateMap = new Map(JSON.parse(stringified));
        const map = new Map();
        for (const [key, val] of intermediateMap.entries()) {
            // @ts-ignore Cannot prove deserialisation is safe
            map.set(key, new Map(val));
        }
        return map;
    }
}

export function clearLocalChanges() {
    localStorage.removeItem("changed");
}

export function storeLocalChanges(changes: Changes) {
    // calling JSON.stringify directly on a map-of-a-map doesn't work, so we
    // need to convert each inner map first
    const intermediateMap = new Map();
    for (const [key, value] of changes.entries()) {
        intermediateMap.set(key, [...value.entries()]);
    }
    localStorage.setItem(
        "changed",
        JSON.stringify([...intermediateMap.entries()])
    );
}

// Note that the way that changes are stored in localStorage does not match the
// JSON expected by the Python API. This function generates the JSON for the API
//
// TODO: unify both of these, it's silly to have two different formats
export function changesToApiJson(changes: Changes): string {
    const obj = {};
    for (const [key, value] of changes.entries()) {
        obj[key] = Object.fromEntries(value.entries());
    }
    return JSON.stringify({ "scenario_json": obj });
}

export function createChangesMap(changed: object): Changes {
    const changesMap = new Map();
    for (const [oa, map] of Object.entries(changed)) {
        changesMap.set(oa, new Map());
        for (const [key, value] of Object.entries(map)) {
            changesMap
                .get(oa)
                .set(key as MacroVar, value as number);
        }
    }
    return changesMap;
}

export function createValuesMap(values: object): Values {
    const valuesMap = new Map();
    for (const [oa, map] of Object.entries(values)) {
        valuesMap.set(oa, new Map());
        for (const [key, value] of Object.entries(map)) {
            if (value === null) {
                throw new Error("Null value in scenario");
            }
            const layerName = key as LayerName;
            valuesMap
                .get(oa)
                .set(layerName, rescale(layerName, value as number));
        }
    }
    return valuesMap;
}

// Create a new scenario and add it to allScenarios
export function createNewScenario(
    name: string, short: string, long: string, description: string,
    changed: Changes, values: Values
): Scenario {
    const newScenario: Scenario = {
        name: name,
        short: short,
        long: long,
        description: description.replace(/\r/g, "").split(/\n+/),
        values: values,
        changed: changed,
    };
    return newScenario;
}
