import geography from "./assets/newcastle.json";
import colormap from "colormap";
import maplibregl from "maplibre-gl";
import { allIndicators, type IndicatorName, allScenarios, type ScenarioName, minValues, maxValues, type FactorName, type CompareView } from "./constants";

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
        feature.properties["sig"] = scenario.values.get(oaName).get("sig");
        feature.properties["sig-color"] = signatures[feature.properties["sig"]].color;
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
                feature.properties["sig-cmp"] = cScenario.values.get(oaName).get("sig");
                feature.properties["sig-cmp-color"] = signatures[feature.properties["sig-cmp"]].color;
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


// Function to manually calculate tick step size, because it seems that
// chart.js's automatic calculation is not quite as polished as matplotlib.
function calculateTickStepSize(max: number, min: number): number {
    let s = (max - min) / 4; // Assuming we want 5 ticks (ish)
    if (s < 0.5) return 0.5;
    if (s < 1) return 1;
    if (s > 10) {
        let orderOfMagnitude = 10 ** Math.floor(Math.log10(s));
        return Math.round(s / orderOfMagnitude) * orderOfMagnitude;
    }
    return Math.round(s);
}

// Generates histogram data for a distribution of values.
// 
// The range between `min` and `max` is partitioned into `nsteps` boxes, and the
// returned array contains the number of values in each box.
//
// @param {number[]} data - The values to be binned.
// @param {number} min - The minimum value to be shown on the histogram.
// @param {number} max - The maximum value to be shown on the histogram.
// @param {number} nsteps - The number of bins to use.
//
// @returns {number[]} An array of length `nsteps` containing the number of
// values in each bin (from smallest to largest).
// @returns {number[]} An array of length `nsteps` containing the centre of each
// bin.
export function bin(data: number[], min: number, max: number, nsteps: number) {
    const stepSize = (max - min) / nsteps;
    let counts = Array(nsteps).fill(0);
    for (const d of data) {
        if (d === max) {
            // Include the maximum value in the last bin
            counts[nsteps - 1] += 1;
        }
        const bin = Math.floor((d - min) / stepSize);
        if (bin >= 0 && bin < nsteps) {
            counts[bin] += 1;
        }
    }
    let centres = Array.from({ length: nsteps }, (_, i) => min + (i + 0.5) * stepSize);

    return [counts, centres];
}


// generate chart data
// TODO: Clean up code duplication!!
export type ChartData = {
    labels: number[];
    datasets: any[];
    showLegend: boolean;
    tickStepSize: number;
};

export function makeChartData(
    indicator: IndicatorName,
    compareView: CompareView,
    scenarioName: ScenarioName,
    compareScenarioName: ScenarioName | null,
    nbars: number
): ChartData {

    function getScenarioShort(name: ScenarioName): string {
        return allScenarios.find((s) => s.name === name).short;
    }

    if (compareScenarioName === null) {
        // Plot one dataset only (current indicator, current scenario)
        let colors: string[] = makeColormap(indicator, nbars);
        let rawValues: number[] = getValues(indicator, scenarioName);
        let min: number = minValues.get(indicator);
        let max: number = maxValues.get(indicator);
        const [counts, centres] = bin(rawValues, min, max, nbars);

        return {
            datasets: [
                {
                    label: getScenarioShort(scenarioName),
                    data: counts,
                    backgroundColor: colors,
                    borderWidth: 0,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0,
                },
            ],
            labels: centres,
            showLegend: false,
            tickStepSize: calculateTickStepSize(max, min),
        };
    }

    else {

        if (compareView === "original") {
            // Plot two datasets (current indicator, current scenario, other
            // scenario))
            let colors: string[] = makeColormap(indicator, nbars);
            let rawValues: number[] = getValues(indicator, scenarioName);
            let cmpRawValues: number[] = getValues(indicator, compareScenarioName);
            let min: number = minValues.get(indicator);
            let max: number = maxValues.get(indicator);
            const [counts, centres] = bin(rawValues, min, max, nbars);
            const [cmpCounts, _] = bin(cmpRawValues, min, max, nbars);

            return {
                datasets: [
                    {
                        label: getScenarioShort(compareScenarioName),
                        data: cmpCounts,
                        // @ts-ignore backgroundColor can be string or string[]
                        backgroundColor: "rgba(1, 1, 1, 0)",
                        borderWidth: 1,
                        borderColor: "#f00",
                        barPercentage: 1,
                        grouped: false,
                        order: 1,
                        categoryPercentage: 1.0,
                    },
                    {
                        label: getScenarioShort(scenarioName),
                        data: counts,
                        backgroundColor: colors,
                        borderWidth: 0,
                        grouped: false,
                        order: 2,
                        categoryPercentage: 1.0,
                        barPercentage: 1.0,
                    },
                ],
                labels: centres,
                showLegend: true,
                tickStepSize: calculateTickStepSize(max, min),
            };
        }

        else if (compareView === "other") {
            // swap scenario with compareScenario and call again
            return makeChartData(indicator, "original", compareScenarioName, scenarioName, nbars);
        }

        else if (compareView === "difference") {
            // Calculate the differences between the compared scenarios and plot those
            let colors: string[] = makeColormap("diff", nbars);
            const scenValues: number[] = getValues(indicator, scenarioName);
            const cmpScenValues: number[] = getValues(indicator, compareScenarioName);
            let rawValues: number[] = scenValues.map((value, i) => value - cmpScenValues[i]);
            let max: number = Math.max(
                Math.abs(Math.min(...rawValues)),
                Math.abs(Math.max(...rawValues))
            );
            let min: number = -max;

            const [counts, centres] = bin(rawValues, min, max, nbars);

            return {
                datasets: [
                    {
                        label: "Difference",
                        data: counts,
                        backgroundColor: colors,
                        borderWidth: 0,
                        categoryPercentage: 1.0,
                        barPercentage: 1.0,
                    },
                ],
                labels: centres,
                showLegend: false,
                tickStepSize: calculateTickStepSize(max, min),
            };
        }
    }
}
