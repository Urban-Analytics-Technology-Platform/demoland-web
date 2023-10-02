import { writable, type Writable } from 'svelte/store';

import { type Scenario, type LayerName } from 'src/constants';

// Create stores, but don't initialise their values yet; this will be done at
// the top of App.svelte.
export const allScenarios: Writable<Map<string, Scenario>> = writable(undefined);
export const scenarioName: Writable<string> = writable(undefined);
export const compareScenarioName: Writable<string | null> = writable(undefined);
export const scaleFactors: Writable<Map<LayerName, { min: number, max: number }>> = writable(undefined);
export const validAreaNames: Writable<Set<string>> = writable(undefined);
export const clickedOAs: Writable<{ id: number, name: string }[]> = writable(undefined);
export const customScenarioInProgress: Writable<boolean> = writable(false);
