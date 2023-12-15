import type { PMPFeatureCollection } from "src/types";

/* --------------------------------- */
/* TYPE DEFINITIONS                  */
/* --------------------------------- */

// Output indicators which we display on the map.
export type Indicator = {
    short: string,
    hover: string,
    less: string,
    more: string,
    less_diff: string,
    more_diff: string,
    colormap: string,
    colormapReversed: boolean
};

/* Model inputs which we display on the map. */
export type Input = { short: string };

// A generic type, handling all inputs and outputs which can be visualised as a map layer.
export type Layer = { short: string };

// Macro variables. Ideally, these would just be `Input`s, but we don't actually
// plot most of these yet (only signature types), so these have to be given a
// new type.
export type MacroVar = "signature_type" | "use" | "greenspace" | "job_types";

// Scenarios
export type ScenarioMetadata = {
    name: string,           // unique identifier
    short: string,          // short description (for dropdown box)
    long: string,           // long description (title in UI)
    description: string,    // full text description
};
export type ScenarioChanges = Map<string, Map<MacroVar, number | null>>;
export type ScenarioValues = Map<string, Map<LayerName, number>>;

export type Scenario = {
    metadata: ScenarioMetadata,   // as described above
    changes: ScenarioChanges,     // inputs changed relative to baseline
    values: ScenarioValues        // values of all indicators and inputs
};

// Corresponding JSON types
export type ChangesObject = { [oa: string]: { [mv in MacroVar]: number } }
export type ValuesObject = { [oa: string]: { [ln in LayerName]: number } }
export type MetadataObject = { name: string, short: string, long: string, description: string }
export type ScenarioObject = { metadata: MetadataObject, changes: ChangesObject, values: ValuesObject }

export type ScaleFactorMap = Map<LayerName, { min: number, max: number }>;

/* --------------------------------- */
/* GEOGRAPHY                         */
/* --------------------------------- */

// This must be a FeatureCollection GeoJSON that covers the area of interest.
// Here, we use a .json extension so that TypeScript can properly import it.
import geography from "src/data/geography.json";
import geo_config from "src/data/geo_config.json";

// Each feature in the GeoJSON file must contain a property that gives a unique
// identifier for each feature. The value of the identifier must be a string.
const featureIdentifier: string = geo_config.featureIdentifier;

// We need to add numeric IDs to each feature if not already present. This is to
// satisfy MapLibre's requirement for hover/click behaviour. The actual numbers
// have no significance so we can simply use the index of the feature in the
// FeatureCollection.
function addNumericIDs(geography: PMPFeatureCollection): PMPFeatureCollection {
    geography.features.forEach((feature, index) => {
        feature.properties.id = index;
    });
    return geography;
}

// Initial latitude of the map
const initialLatitude: number = geo_config.initialLatitude;
// Initial longitude of the map
const initialLongitude: number = geo_config.initialLongitude;
// Initial zoom level of the map
const initialZoom: number = geo_config.initialZoom;
// Name of the area of interest
const areaName: string = geo_config.areaName;

/* --------------------------------- */
/* SCENARIOS                         */
/* --------------------------------- */

// These are JSON files containing the spatial signature and indicator values
// for each scenario.
import baseline from "src/data/scenarios/baseline.json";
import scenario1 from "src/data/scenarios/scenario1.json";
import scenario2 from "src/data/scenarios/scenario2.json";
import scenario3 from "src/data/scenarios/scenario3.json";
import scenario4 from "src/data/scenarios/scenario4.json";
import scenario5 from "src/data/scenarios/scenario5.json";
import scenario6 from "src/data/scenarios/scenario6.json";
import scenario7 from "src/data/scenarios/scenario7.json";

// One of the scenarios is used as the 'reference', against which values are
// scaled.
const referenceScenarioObject = baseline;

// Range to scale all indicator values between (for the baseline).
const scale = {
    min: 0,
    max: 100,
}

// List all the other scenarios here.
const otherScenarioObjects = [
    scenario1,
    scenario1,
    scenario2,
    scenario3,
    scenario4,
    scenario5,
    scenario6,
    scenario7
]

/* --------------------------------- */
/* INDICATORS                        */
/* --------------------------------- */

// Do not insert a type annotation here! TypeScript will infer the most
// restrictive type possible, which allows us to subsequently extract
// IndicatorName as a union type of all the keys in this object.
const allIndicators = {
    // The IndicatorName here must match with the name of the indicator given in
    // the JSON file.
    "air_quality": {
        // This is an actual prose name of the indicator used in the UI.
        "short": "Air pollution",
        // This is used in the map hover text. Generally you'll want this to be
        // the same as 'short', but in the original DemoLand app 'accessibility'
        // is condensed to 'access.' to save space.
        "hover": "Air pollution",
        // 'less' and 'more' are used in the charts to describe what smaller and
        // larger values mean respectively.
        "less": "cleaner",
        "more": "more polluted",
        // 'less_diff' and 'more_diff' are used in charts that compare two
        // scenarios. 'less_diff' should describe what happens for areas where
        // the value of the indicator decreases, and vice versa for 'more_diff'.
        "less_diff": "improved",
        "more_diff": "worsened",
        // The name of the colormap to use for this indicator, and whether to
        // reverse it. A list of available names can be found at
        // https://www.npmjs.com/package/colormap.
        "colormap": "magma",
        "colormapReversed": false,
    },
    "house_price": {
        "short": "House prices",
        "hover": "House prices",
        "less": "cheaper",
        "more": "more expensive",
        "less_diff": "decreased",
        "more_diff": "increased",
        "colormap": "viridis",
        "colormapReversed": false,
    },
    "job_accessibility": {
        "short": "Job accessibility",
        "hover": "Job access.",
        "less": "lower",
        "more": "higher",
        "less_diff": "decreased",
        "more_diff": "increased",
        "colormap": "plasma",
        "colormapReversed": false,
    },
    "greenspace_accessibility": {
        "short": "Greenspace accessibility",
        "hover": "Greenspace access.",
        "less": "lower",
        "more": "higher",
        "less_diff": "decreased",
        "more_diff": "increased",
        "colormap": "chlorophyll",
        "colormapReversed": true,
    },
};

/* --------------------------------- */
/* SPATIAL SIGNATURES                */
/* --------------------------------- */

// This probably does not need to be changed. Note that the order of the
// signatures is important: signatures are stored as integers in the JSON files
// and this list is indexed using those integers to get the correct signature.
const signatures = [
    {
        "name": "Wild countryside",
        "color": "#d7ded1",
        "job_d1": 0.2307692308,
        "job_d9": 0.5801975309,
        "use_d1": 0.044990606,
        "use_d9": 0.5892211644
    },
    {
        "name": "Countryside agriculture",
        "color": "#f2e6c7",
        "job_d1": 0.229142535,
        "job_d9": 0.7031759556,
        "use_d1": -0.1986845208,
        "use_d9": 0.6906424058
    },
    {
        "name": "Urban buffer",
        "color": "#c2d0d9",
        "job_d1": 0.2645245771,
        "job_d9": 0.7422680412,
        "use_d1": 0.0688937326,
        "use_d9": 0.7689247424
    },
    {
        "name": "Warehouse/Park land",
        "color": "#c3abaf",
        "job_d1": 0.1764706388,
        "job_d9": 0.7980769231,
        "use_d1": -0.5330864468,
        "use_d9": 0.7905052697
    },
    {
        "name": "Open sprawl",
        "color": "#d7a59f",
        "job_d1": 0.2984615385,
        "job_d9": 0.7799113737,
        "use_d1": 0.1611908739,
        "use_d9": 0.79067578
    },
    {
        "name": "Disconnected suburbia",
        "color": "#f0d17d",
        "job_d1": 0.3536585366,
        "job_d9": 0.7934118177,
        "use_d1": 0.2544929783,
        "use_d9": 0.8022311756
    },
    {
        "name": "Accessible suburbia",
        "color": "#8fa37e",
        "job_d1": 0.3640186103,
        "job_d9": 0.7802045479,
        "use_d1": 0.3862093858,
        "use_d9": 0.7964351173
    },
    {
        "name": "Connected residential neighbourhoods",
        "color": "#94666e",
        "job_d1": 0.3347880155,
        "job_d9": 0.8226219671,
        "use_d1": 0.1836960102,
        "use_d9": 0.7934267429
    },
    {
        "name": "Dense residential neighbourhoods",
        "color": "#678ea6",
        "job_d1": 0.3042270633,
        "job_d9": 0.8394626321,
        "use_d1": -0.2196994108,
        "use_d9": 0.767701265
    },
    {
        "name": "Gridded residential quarters",
        "color": "#e4cbc8",
        "job_d1": 0.3869775942,
        "job_d9": 0.8190790739,
        "use_d1": 0.1423421619,
        "use_d9": 0.7847879704
    },
    {
        "name": "Dense urban neighbourhoods",
        "color": "#efc758",
        "job_d1": 0.2952175012,
        "job_d9": 0.8681238226,
        "use_d1": -0.4874049471,
        "use_d9": 0.7381499662
    },
    {
        "name": "Local urbanity",
        "color": "#3b6e8c",
        "job_d1": 0.3226690243,
        "job_d9": 0.8865929841,
        "use_d1": -0.7232868016,
        "use_d9": 0.7183937729
    },
    {
        "name": "Regional urbanity",
        "color": "#ab888e",
        "job_d1": 0.3996857274,
        "job_d9": 0.9051496044,
        "use_d1": -0.6217777543,
        "use_d9": 0.6964795358
    },
    {
        "name": "Metropolitan urbanity",
        "color": "#bc5b4f",
        "job_d1": 0.5281291173,
        "job_d9": 0.9448576949,
        "use_d1": -0.8206404544,
        "use_d9": 0.5366170123
    },
    {
        "name": "Concentrated urbanity",
        "color": "#333432",
        "job_d1": 0.6853582555,
        "job_d9": 0.9180880262,
        "use_d1": -0.9853343597,
        "use_d9": -0.61619044
    },
    {
        "name": "Hyper concentrated urbanity",
        "color": "#a7b799",
        "job_d1": 0.6340095491,
        "job_d9": 0.8429180008,
        "use_d1": -0.9432273745,
        "use_d9": -0.6446765856
    }]

/* --------------------------------- */
/* CUSTOM SCENARIO CREATION          */
/* --------------------------------- */

// The base URL of the GitHub Pages site where the web app is hosted.
const baseUrl = "https://urban-analytics-technology-platform.github.io/demoland-web";

// This is the endpoint to send POST requests to in order to calculate
// indicators for a new scenario. See the project book
// (https://urban-analytics-technology-platform.github.io/demoland-project/book/developer_notes.html)
// for the API specification.
const webApiUrl = "https://demolandapi.azurewebsites.net/api/scenario";

/* ----------------------------------------------------- */
/* Everything after this does not need to be modified.   */
/* ----------------------------------------------------- */

export type IndicatorName = keyof typeof allIndicators;

const allInputs = { "signature_type": { "short": "Spatial signatures" } }

export type InputName = keyof typeof allInputs;

export type LayerName = InputName | IndicatorName;

const allIndicatorsMap: Map<IndicatorName, Indicator> = new Map(Object.entries(allIndicators));
const allInputsMap: Map<InputName, Input> = new Map(Object.entries(allInputs));

const allLayers: Map<LayerName, Layer> = new Map(
    [...allInputsMap.entries(), ...allIndicatorsMap.entries()]
);

interface Config {
    geography: PMPFeatureCollection;
    featureIdentifier: string;
    initialLatitude: number;
    initialLongitude: number;
    initialZoom: number;
    referenceScenarioObject: ScenarioObject;
    otherScenarioObjects: ScenarioObject[];
    signatures: { name: string, color: string, job_d1: number, job_d9: number, use_d1: number, use_d9: number }[];
    allIndicators: Map<IndicatorName, Indicator>;
    allInputs: Map<InputName, Input>;
    allLayers: Map<LayerName, Layer>;
    scale: {
        min: number;
        max: number;
    };
    baseUrl: string;
    webApiUrl: string;
    areaName: string;
}

export const config: Config = {
    areaName: areaName,
    initialLatitude: initialLatitude,
    initialLongitude: initialLongitude,
    initialZoom: initialZoom,
    // We need the type cast here because the imported JSON file is not typed
    // strictly enough. For example, when TS reads in
    //     { type: "FeatureCollection", ... } 
    // this gets interpreted as
    //     {type: string}
    // when in fact we want the string literal type
    //     {type: "FeatureCollection"}. 
    // If we embedded the GeoJSON in a TypeScript file as an object literal
    // (instead of importing it), we could get around this using a const
    // assertion: { type: "FeatureCollection" as const, ...}. But presently
    // there is no way to do this with imported JSON files. See
    // https://github.com/microsoft/TypeScript/issues/32063.
    geography: addNumericIDs(geography as PMPFeatureCollection),
    featureIdentifier: featureIdentifier,
    referenceScenarioObject: referenceScenarioObject,
    otherScenarioObjects: otherScenarioObjects,
    signatures: signatures,
    allIndicators: allIndicatorsMap,
    allInputs: allInputsMap,
    allLayers: allLayers,
    scale: scale,
    baseUrl: baseUrl,
    webApiUrl: webApiUrl,
};
