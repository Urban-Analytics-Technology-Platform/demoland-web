import { type ScenarioChanges } from "src/constants";

// Helper functions to load / save changes from localStorage
export function getLocalChanges(): ScenarioChanges {
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

export function storeLocalChanges(changes: ScenarioChanges) {
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
export function changesToApiJson(changes: ScenarioChanges): string {
    const obj = {};
    for (const [key, value] of changes.entries()) {
        obj[key] = Object.fromEntries(value.entries());
    }
    return JSON.stringify({ "scenario_json": obj });
}
