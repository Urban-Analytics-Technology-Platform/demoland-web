/* Output indicators */

export type IndicatorName = "air_quality" | "house_price" | "job_accessibility" | "greenspace_accessibility";

export type Indicator = { short: string, less: string, more: string, less_diff: string, more_diff: string, colormap: string, colormapReversed: boolean };

export const allIndicators: Map<IndicatorName, Indicator> = new Map([
    ["air_quality", {
        "short": "Air pollution",
        "less": "cleaner",
        "more": "more polluted",
        "less_diff": "improved",
        "more_diff": "worsened",
        "colormap": "magma",
        "colormapReversed": false,
    }],
    ["house_price", {
        "short": "House prices",
        "less": "cheaper",
        "more": "more expensive",
        "less_diff": "decreased",
        "more_diff": "increased",
        "colormap": "viridis",
        "colormapReversed": false,
    }],
    ["job_accessibility", {
        "short": "Job accessibility",
        "less": "lower",
        "more": "higher",
        "less_diff": "decreased",
        "more_diff": "increased",
        "colormap": "plasma",
        "colormapReversed": false,
    }],
    ["greenspace_accessibility", {
        "short": "Greenspace accessibility",
        "less": "lower",
        "more": "higher",
        "less_diff": "decreased",
        "more_diff": "increased",
        "colormap": "chlorophyll",
        "colormapReversed": true,
    }],
]);


/* Model inputs (land use) */

export type InputName = "signature_type";

export type Input = { short: string };

export const allInputs: Map<InputName, Input> = new Map([
    ["signature_type", { "short": "Spatial signatures" }]
]);

/* A generic type, handling all inputs and outputs which can be visualised as a
 * map layer */

export type LayerName = InputName | IndicatorName;

export type Layer = { short: string };

export const allLayers: Map<LayerName, Layer> = new Map(
    [...allInputs.entries(), ...allIndicators.entries()]
);

/* Scenarios */
// Most of this code was shifted to scenarios.ts.

export type OA = string;

// Range to scale all indicator values to
export const GLOBALMIN = 0;
export const GLOBALMAX = 100;

// Macro variables. Ideally, these would just be `Input`s, but we don't actually
// plot most of these yet (only signature types), so these have to be given a
// new type.
export type MacroVar = "signature_type" | "use" | "greenspace" | "job_types";

export type Scenario = {
    name: string,                                    // unique identifier
    short: string,                                   // short description (for dropdown box)
    long: string,                                    // long description (title in UI)
    values: Map<OA, Map<LayerName, number>>,         // values of all indicators and inputs
    description: string[],                           // full text description (uses raw HTML)
    changed: Map<OA, Map<MacroVar, number | null>>,  // inputs changed relative to baseline
};

export const signatures = [
    { name: "Wild countryside", color: "#d7ded1" },
    { name: "Countryside agriculture", color: "#f2e6c7" },
    { name: "Urban buffer", color: "#c2d0d9" },
    { name: "Warehouse/Park land", color: "#c3abaf" },
    { name: "Open sprawl", color: "#d7a59f" },
    { name: "Disconnected suburbia", color: "#f0d17d" },
    { name: "Accessible suburbia", color: "#8fa37e" },
    { name: "Connected residential neighbourhoods", color: "#94666e" },
    { name: "Dense residential neighbourhoods", color: "#678ea6" },
    { name: "Gridded residential quarters", color: "#e4cbc8" },
    { name: "Dense urban neighbourhoods", color: "#efc758" },
    { name: "Local urbanity", color: "#3b6e8c" },
    { name: "Regional urbanity", color: "#ab888e" },
    { name: "Metropolitan urbanity", color: "#bc5b4f" },
    { name: "Concentrated urbanity", color: "#333432" },
    { name: "Hyper concentrated urbanity", color: "#a7b799" },
];
