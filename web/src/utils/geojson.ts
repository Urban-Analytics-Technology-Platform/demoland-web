import geography from "src/data/geography.json";
import maplibregl from "maplibre-gl";
import union from "@turf/union";
import { allLayers, type LayerName, type MacroVar } from "src/constants";
import { getScenario } from "src/utils/scenarios";
import { getColor, getDiffColor } from "src/utils/colors";
import config from "src/data/config";

/** The indicator values are stored as a JSON file, separate from the
 * geometry data. This allows the geometry data to be reused for different
 * scenarios. However, it also means that we need to merge the two data
 * sources together before we can display them on the map.
 *
 * It also proves easier to encode the colours for each indicator here, because
 * otherwise it results in some really complicated expressions in MapLibre.
 * 
 * @param {string} scenarioName: the name of the scenario being used.
 * @param {string} compareScenarioName: the name of the scenario being
 * compared against.
 *
 * @returns an updated GeoJSON file with the indicator values plus associated
 * colours added to the properties of each feature.
 */
export function makeCombinedGeoJSON(
    scenarioName: string,
    compareScenarioName: string | null,
): GeoJSON.FeatureCollection {
    const scenario = getScenario(scenarioName);
    const cScenario = compareScenarioName === null ? null : getScenario(compareScenarioName);

    // Precalculate differences between scenarios being compared, which gives us
    // the min and max values for the 'diff' colormap.
    const maxDiffExtents: Map<LayerName, number> = new Map();
    if (cScenario !== null) {
        for (const layerName of allLayers.keys()) {
            const diffs: number[] = [];
            for (const oa of scenario.values.keys()) {
                diffs.push(scenario.values.get(oa).get(layerName) - cScenario.values.get(oa).get(layerName));
            }
            const maxDiff = Math.max(...diffs.map(d => Math.abs(d)));
            maxDiffExtents.set(layerName, maxDiff === 0 ? 1 : maxDiff);
        }
    }

    const newGeography = JSON.parse(JSON.stringify(geography));
    // Merge geography with indicators
    newGeography.features = newGeography.features.map(function(feature) {
        const oaName = feature.properties[config.featureIdentifier];
        const oaValues = scenario.values.get(oaName);
        if (oaValues === undefined) {
            throw new Error(`${oaName} not found in values!`);
        }
        for (const layerName of allLayers.keys()) {
            const value = oaValues.get(layerName);
            feature.properties[layerName] = value;
            feature.properties[`${layerName}-color`] = getColor(layerName, value);
        }
        if (cScenario !== null) {
            const cOaValues = cScenario.values.get(oaName);
            if (cOaValues === undefined) {
                throw new Error(`Output area ${oaName} not found in compare values; this should not happen`);
            }
            for (const layerName of allLayers.keys()) {
                const value = oaValues.get(layerName);
                const cmpValue = cOaValues.get(layerName);
                feature.properties[`${layerName}-cmp`] = cmpValue;
                feature.properties[`${layerName}-cmp-color`] = getColor(layerName, cmpValue);
                feature.properties[`${layerName}-diff`] = value - cmpValue;
                feature.properties[`${layerName}-diff-color`] = getDiffColor(layerName, value, cmpValue, maxDiffExtents);
            }
        }

        // @ts-ignore GeoJSON types don't seem to recognise feature id
        feature.id = feature.properties.id;
        return feature;
    });

    // TODO: Figure out how to not cast here
    return newGeography as GeoJSON.FeatureCollection;
}

/**
 * Obtain the LngLatBoundsLike of a Polygon or MultiPolygon geometry object from its coordinates.
 *
 * @param geometry The geometry object to get the bounds of.
 * @returns The bounds of the geometry.
 */
export function getGeometryBounds(geometry: GeoJSON.Geometry): maplibregl.LngLatBounds {
    // Helper function which acts on a list of positions.
    function getBoundsFromPositionList(positions: GeoJSON.Position[]): maplibregl.LngLatBounds {
        const initialBounds = new maplibregl.LngLatBounds(positions[0], positions[0]);
        return positions.reduce(function(bounds, posn) {
            // GeoJSON Positions are defined as number[] because they may in
            // principle contain x,y,z (+more) coordinates. We only care about x
            // and y here.
            const coords: maplibregl.LngLatLike = [posn[0], posn[1]];
            return bounds.extend(coords);
        }, initialBounds);
    }

    const geometryType = geometry["type"];
    if (geometryType == "Polygon") {
        // For a Polygon, the first element of the coordinates array is the
        // outer ring, which is the only thing we need.
        return getBoundsFromPositionList(geometry["coordinates"][0]);
    }
    else if (geometryType == "MultiPolygon") {
        // For a MultiPolygon, we just need to get the bounds of each Polygon
        // and then combine them.
        const boundsList = geometry["coordinates"].map(polygon => getBoundsFromPositionList(polygon[0]));
        return boundsList.reduce((bounds, b) => bounds.extend(b));
    }
    else {
        throw new Error(`Unsupported geometry type: ${geometryType}`);
    }
}


/**
 * Check if two maps are equal.
 *
 * @param m1 The first map.
 * @param m2 The second map.
 * @returns true if the maps are equal, false otherwise.
 */
function mapsAreEqual<K, V>(m1: Map<K, V>, m2: Map<K, V>): boolean {
    // Check if the maps have the same number of keys
    if (m1.size !== m2.size) {
        return false;
    }
    // Then check each key
    for (const [k, v] of m1.entries()) {
        if (m2.get(k) !== v) {
            return false;
        }
    }
    return true;
}

/**
 * Get the geographic boundary of the areas which differ between two scenarios.
 * This is done by comparing the values of each input variable in each area,
 * collating the areas where the values differ, and then performing a union of
 * these areas.
 *
 * @param scenarioName First scenario
 * @param compareScenarioName Second scenario
 * @returns A GeoJSON FeatureCollection containing the boundaries of the areas
 * as a MultiPolygon.
 */
export function getInputDiffBoundaries(
    scenarioName: string,
    compareScenarioName: string | null
): GeoJSON.FeatureCollection {
    type MVMap = Map<string, Map<MacroVar, number | null>>;
    const changed: MVMap = getScenario(scenarioName).changed;
    const cChanged: MVMap = compareScenarioName === null
        ? new Map()
        : getScenario(compareScenarioName).changed;

    // Determine OAs which are different
    const allPossibleOAs: Set<string> = new Set([
        ...changed.keys(), ...cChanged.keys()
    ]);
    const differentOAs: Set<string> = new Set();
    for (const oa of allPossibleOAs) {
        const m1 = changed.get(oa);
        const m2 = cChanged.get(oa);
        if (m1 === undefined && m2 === undefined) {
            // Both undefined - no changes occurred wrt baseline
            continue;
        }
        else if (m1 === undefined || m2 === undefined) {
            // One undefined - two scenarios are definitely different
            differentOAs.add(oa);
        }
        else {
            // Both defined - need to check if they are equal
            if (!mapsAreEqual(m1, m2)) differentOAs.add(oa);
        }
    }

    // Extract these OAs from the base geography
    const boundary = {
        "type": "FeatureCollection",
        "crs": geography.crs,
        "features": geography.features.filter(
            feature => differentOAs.has(feature.properties[config.featureIdentifier])
        ),
    } as GeoJSON.FeatureCollection;

    // Dissolve the boundaries. But we can't actually use dissolve because that
    // doesn't work with MultiPolygons. We instead use union in a nice,
    // functional-style loop.
    if (boundary.features.length > 0) {
        const unioned = boundary.features.reduce((acc, feature) => {
            const featureGeometry = feature.geometry;
            // @ts-ignore Not sure how to best coerce GeoJSON types right now. But it works.
            return union(acc, featureGeometry);
        });
        boundary.features = [unioned];
    }
    return boundary;
}
