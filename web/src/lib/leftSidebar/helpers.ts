import { type ScenarioChanges } from "src/constants";

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
