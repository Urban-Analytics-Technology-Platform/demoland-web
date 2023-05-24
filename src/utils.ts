import geography from "./assets/newcastle.json";
import colormap from "colormap";
import maplibregl from "maplibre-gl";
import { allIndicators, type IndicatorName, allScenarios, type ScenarioName } from "./constants";

function makeColormap(indicator: IndicatorName, n: number) {
    if (indicator === "air_quality") {
        return colormap({
            colormap: "oxygen",
            nshades: n,
            format: "hex",
            alpha: 1,
        }).reverse();
    } else if (indicator === "house_price") {
        return colormap({
            colormap: "density",
            nshades: n,
            format: "hex",
            alpha: 1,
        });
    } else if (indicator === "job_accessibility") {
        return colormap({
            colormap: "viridis",
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
}

const colormaps: { [key: string]: string[] } = {
    "air_quality": makeColormap("air_quality", 100),
    "house_price": makeColormap("house_price", 100),
    "job_accessibility": makeColormap("job_accessibility", 100),
    "greenspace_accessibility": makeColormap("greenspace_accessibility", 100),
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
 *
 * @returns an updated GeoJSON file with the indicator values plus associated
 * colours added to the properties of each feature.
 */
export function makeCombinedGeoJSON(
    scenarioName: ScenarioName,
): GeoJSON.FeatureCollection {
    const scenario = allScenarios.find(s => s.name === scenarioName);

    // Calculate min and max values.
    const minValues = new Object();
    const maxValues = new Object();
    for (let indicator of allIndicators) {
        minValues[indicator.name] = Math.min(
            ...Object.values(scenario.values).map((o: object) => o[indicator.name])
        );
        maxValues[indicator.name] = Math.max(
            ...Object.values(scenario.values).map((o: object) => o[indicator.name])
        );
    }

    // Merge geography with indicators
    geography["features"] = geography["features"].map(function(feature) {
        const oaName = feature["properties"]["OA11CD"];
        const oaValues = scenario.values[oaName];
        if (oaValues === undefined) {
            console.log(`${oaName} not found in values!`);
        } else {
            for (const indi in oaValues) {
                feature["properties"][indi] = oaValues[indi];
                feature["properties"][`${indi}-color`] =
                    getColorFromMap(colormaps[indi], oaValues[indi], minValues[indi], maxValues[indi]);
            }
        }
        return feature;
    });

    // TODO: Figure out how to not cast here
    return geography as GeoJSON.FeatureCollection;
}

export type ChartData = { colors: string[]; values: number[]; counts: number[] };

// TODO Document
export function makeChartData(geojson: GeoJSON.FeatureCollection, indicator: IndicatorName, nbars: number): ChartData {
    const colors = makeColormap(indicator, nbars);
    const rawValues: number[] = geojson.features.map(feature => feature.properties[indicator]);
    // quantise rawValues to 0 -> 19
    const min = Math.min(...rawValues);
    const max = Math.max(...rawValues);
    const intValues = rawValues.map(value => Math.round(((value - min) / (max - min)) * (nbars - 1)));
    // get the counts of each value (y-axis)
    const counts = new Array(nbars).fill(0);
    for (const value of intValues) {
        counts[value]++;
    }
    // generate the x-axis values, which are 0 -> 19 but rescaled back to the
    // original range of indicator values
    const values = Array.from({ length: nbars }, (_, i) => i)
        .map(value => value * (max - min) / (nbars - 1) + min);

    return {
        counts: counts,
        values: values,
        colors: colors,
    }
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
