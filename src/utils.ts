import geography from "./assets/newcastle.json";
import colormap from "colormap";
import maplibregl from "maplibre-gl";
import { allIndicators, type IndicatorName, allScenarios, type ScenarioName, minValues, maxValues } from "./constants";

export function makeColormap(indicator: IndicatorName | "diff", n: number) {
    if (indicator === "air_quality") {
        return colormap({
            colormap: "magma",
            nshades: n,
            format: "hex",
            alpha: 1,
        }).reverse();
    } else if (indicator === "house_price") {
        return colormap({
            colormap: "viridis",
            nshades: n,
            format: "hex",
            alpha: 1,
        });
    } else if (indicator === "job_accessibility") {
        return colormap({
            colormap: "plasma",
            nshades: n,
            format: "hex",
            alpha: 1,
        });
    } else if (indicator === "greenspace_accessibility") {
        return colormap({
            colormap: "chlorophyll",
            nshades: n,
            format: "hex",
            alpha: 1,
        }).reverse();
    }
    else if (indicator === "diff") {
        return colormap({
            colormap: "RdBu",
            nshades: n,
            format: "hex",
            alpha: 1,
        });
    }
}

// Get all values for a given indicator in a given scenario.
export function getValues(indicator: IndicatorName, scenarioName: ScenarioName): number[] {
    const scenario = allScenarios.find(s => s.name === scenarioName);
    return [...scenario.values.values()].map(m => m.get(indicator));
}

const colormaps: { [key: string]: string[] } = {
    "air_quality": makeColormap("air_quality", 100),
    "house_price": makeColormap("house_price", 100),
    "job_accessibility": makeColormap("job_accessibility", 100),
    "greenspace_accessibility": makeColormap("greenspace_accessibility", 100),
    "diff": makeColormap("diff", 100),
}

function getColorFromMap(map: string[], value: number, min: number, max: number) {
    const n = map.length;
    const i = Math.round(((value - min) / (max - min)) * (n - 1));
    return map[i];
}

/** The indicator values are stored as a JSON file, separate from the
 * geometry data. This allows the geometry data to be reused for different
 * scenarios. However, it also means that we need to merge the two data
 * sources together before we can display them on the map.
 *
 * It also proves easier to encode the colours for each indicator here, because
 * otherwise it results in some really complicated expressions in MapLibre.
 * 
 * @param {ScenarioName} scenarioName: the name of the scenario being used.
 * @param {ScenarioName} compareScenarioName: the name of the scenario being
 * compared against.
 *
 * @returns an updated GeoJSON file with the indicator values plus associated
 * colours added to the properties of each feature.
 */
export function makeCombinedGeoJSON(
    scenarioName: ScenarioName,
    compareScenarioName: ScenarioName | null,
): GeoJSON.FeatureCollection {
    const scenario = allScenarios.find(s => s.name === scenarioName);

    // Precalculate differences between scenarios being compared
    let maxDiffExtent: Map<IndicatorName, number> = new Map();
    if (compareScenarioName !== null) {
        const scenario = allScenarios.find(s => s.name === scenarioName);
        const cScenario = allScenarios.find(s => s.name === compareScenarioName);
        for (const indi of allIndicators) {
            const n = indi.name;
            let diffs: number[] = [];
            for (const oa of scenario.values.keys()) {
                diffs.push(scenario.values.get(oa).get(n) - cScenario.values.get(oa).get(n));
            }
            const maxDiff = Math.max(...diffs.map(d => Math.abs(d)));
            maxDiffExtent.set(n, maxDiff === 0 ? 1 : maxDiff);
        }
    }

    // Merge geography with indicators
    geography.features = geography.features.map(function(feature) {
        const oaName = feature.properties.OA11CD;
        const oaValues = scenario.values.get(oaName);
        if (oaValues === undefined) {
            throw new Error(`${oaName} not found in values!`);
        }
        for (const indi of allIndicators) {
            const n = indi.name;
            feature.properties[n] = oaValues.get(n);
            feature.properties[`${n}-color`] =
                getColorFromMap(colormaps[n], oaValues.get(n), minValues.get(n), maxValues.get(n));
        }
        if (compareScenarioName !== null) {
            const cScenario = allScenarios.find(s => s.name === compareScenarioName);
            const cOaValues = cScenario.values.get(oaName);
            if (cOaValues === undefined) {
                throw new Error(`${oaName} not found in compare values!`);
            }
            for (const indi of allIndicators) {
                const n = indi.name;
                feature.properties[`${n}-cmp`] = cOaValues.get(n);
                feature.properties[`${n}-cmp-color`] =
                    getColorFromMap(colormaps[n], cOaValues.get(n), minValues.get(n), maxValues.get(n));
                feature.properties[`${n}-diff`] = oaValues.get(n) - cOaValues.get(n);
                feature.properties[`${n}-diff-color`] =
                    getColorFromMap(colormaps["diff"], oaValues.get(n) - cOaValues.get(n), -maxDiffExtent.get(n), maxDiffExtent.get(n));
            }
        }

        // @ts-ignore GeoJSON types don't seem to recognise feature id
        feature.id = feature.properties.id;
        return feature;
    });

    // TODO: Figure out how to not cast here
    return geography as GeoJSON.FeatureCollection;
}

// Obtain the LngLatBoundsLike of a Polygon or MultiPolygon geometry object from its coordinates.
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
