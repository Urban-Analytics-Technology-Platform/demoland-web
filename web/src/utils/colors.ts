import colormap from "colormap";
import { type IndicatorName, type LayerName, config } from "src/data/config";

export function makeColormap(indicator: IndicatorName | "diff", n: number): string[] {
    if (indicator === "diff") {
        return colormap({
            colormap: "RdBu",
            nshades: n,
            format: "hex",
            alpha: 1,
        });
    }
    else {
        const indi = config.allIndicators.get(indicator);
        const cmap = colormap({
            colormap: indi.colormap,
            nshades: n,
            format: "hex",
            alpha: 1,
        });
        return indi.colormapReversed ? cmap.reverse() : cmap;
    }
}

const colormaps: Map<IndicatorName | "diff", string[]> = new Map([
    ["diff", makeColormap("diff", 100)],
])
for (const indiName of config.allIndicators.keys()) {
    colormaps.set(indiName, makeColormap(indiName, 100));
}

function getColorFromMap(map: string[], value: number, min: number, max: number) {
    const n = map.length;
    let i = Math.round(((value - min) / (max - min)) * (n - 1));
    // Clamp to [0, n-1]
    i = Math.min(Math.max(i, 0), n - 1);
    return map[i];
}

/**
 * Calculate the colour which should be shown on the map for a given scenario.
 *
 * @param layerName The name of the layer being displayed
 * @param value The value of the layer in the scenario
 */
export function getColor(layerName: LayerName, value: number) {
    if (layerName === "signature_type") {
        // Categorical variable
        return config.signatures[value].color;
    }
    else {
        // Continuous variables, use the respective colormaps
        return getColorFromMap(colormaps.get(layerName), value, config.scale.min, config.scale.max);
    }
}

/**
 * Calculate the colour which should be shown on the map in 'difference' mode
 * (when a scenario is being compared against).
 *
 * @param layerName The name of the layer being displayed
 * @param value The value of the layer in the main scenario
 * @param cmpValue The value of the layer in the scenario being compared
 * against
 * @param maxDiffExtents A map of the maximum difference between the main
 * scenario and the scenario being compared against for each layer. This is
 * pre-calculated for efficiency inside the `makeCombinedGeoJSON` function.
 * @returns The colour which should be shown on the map.
 */
export function getDiffColor(layerName: LayerName, value: number, cmpValue: number,
    maxDiffExtents: Map<LayerName, number>) {
    if (layerName === "signature_type") {
        // Categorical variable. If it's the same, we don't show anything. If
        // it's different, we show the color of the main scenario.
        return value === cmpValue ? "rgba(0, 0, 0, 0.1)" : config.signatures[value].color;
    }
    else {
        // Continuous variables, use 'diff' colormap
        return value === cmpValue
            ? "rgba(0, 0, 0, 0.1)"
            : getColorFromMap(colormaps.get("diff"), value - cmpValue, -maxDiffExtents.get(layerName), maxDiffExtents.get(layerName));
    }
}
