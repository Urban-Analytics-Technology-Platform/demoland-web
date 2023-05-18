import geography from "./assets/newcastle.json";
import colormap from "colormap";
import { allIndicators } from "./indicators";

const colormaps: { [key: string]: string[] } = {
    "air_quality": colormap({
        colormap: "oxygen",
        nshades: 100,
        format: "hex",
        alpha: 1,
    }).reverse(),
    "house_price": colormap({
        colormap: "density",
        nshades: 100,
        format: "hex",
        alpha: 1,
    }),
    "job_accessibility":
        colormap({
            colormap: "viridis",
            nshades: 100,
            format: "hex",
            alpha: 1,
        }),
    "greenspace_accessibility":
        colormap({
            colormap: "chlorophyll",
            nshades: 100,
            format: "hex",
            alpha: 1,
        }).reverse(),
}

function getColorFromMap(map: string[], value: number, min: number, max: number) {
    const n = map.length;
    const i = Math.round(((value - min) / (max - min)) * n);
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
 * @param {string} indicatorsRaw: the raw JSON string of the indicator data.
 * This JSON should be structured in the following format:
 *   { oa_name: { indicator_name: indicator_value, ... }, ... }
 * where the indicator_name's are the same as those in allIndicators.
 *
 * @returns [geography, minValues, maxValues] where geography is an updated
 * GeoJSON file with the indicator values plus associated colours added to the
 * properties of each feature. minValues and maxValues are objects with the same
 * keys as allIndicators, and the values are the minimum and maximum values of
 * the indicator across all OAs.
 */
export function mergeGeographyWithIndicators(
    indicatorsRaw: string
) {
    const indicators = JSON.parse(indicatorsRaw);

    // Calculate min and max values. TODO write better code
    const minValues = new Object();
    const maxValues = new Object();
    for (let indicator of allIndicators) {
        minValues[indicator] = Math.min(
            ...Object.values(indicators).map((o: object) => o[indicator])
        );
        maxValues[indicator] = Math.max(
            ...Object.values(indicators).map((o: object) => o[indicator])
        );
    }
    console.log(minValues);

    // Merge geography with indicators
    geography["features"] = geography["features"].map(function(
        feature: object
    ) {
        const oaName = feature["properties"]["OA11CD"];
        const oaValues = indicators[oaName];
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

    // TODO give this return type some structure
    return [geography, minValues, maxValues];
}
