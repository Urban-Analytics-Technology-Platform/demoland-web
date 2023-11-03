/* Output indicators */

export type IndicatorName = "air_quality" | "house_price" | "job_accessibility" | "greenspace_accessibility";

export type Indicator = { short: string, hover: string, less: string, more: string, less_diff: string, more_diff: string, colormap: string, colormapReversed: boolean };

/* Model inputs (land use) */

export type InputName = "signature_type";

export type Input = { short: string };

/* A generic type, handling all inputs and outputs which can be visualised as a
 * map layer */

export type LayerName = InputName | IndicatorName;

export type Layer = { short: string };

/* Scenarios */
// Most of this code was shifted to scenarios.ts.

export type OA = string;

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

// A GeoJSON FeatureCollection, but narrowed down such that each of the features
// is either a Polygon or a MultiPolygon.
export type PMPFeature = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, GeoJSON.GeoJsonProperties>;
export interface PMPFeatureCollection extends GeoJSON.GeoJsonObject {
    type: "FeatureCollection";
    features: Array<PMPFeature>;
}
