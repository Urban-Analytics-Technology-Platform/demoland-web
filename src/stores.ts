import { writable, type Writable } from "svelte/store";
import type { Map } from "maplibre-gl";

export const map: Writable<Map> = writable(null);
