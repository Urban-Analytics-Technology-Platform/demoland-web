import {
    type IndicatorName,
    GLOBALMIN,
    GLOBALMAX,
} from "src/constants";
import { getScenario, getValues, makeColormap } from "src/utils";

// Automatically calculate a suitable tick step size for a histogram. Chart.js's
// automatic calculation is not quite as polished as matplotlib.
//
// @param {number} max - The maximum value to be shown on the histogram.
// @param {number} min - The minimum value to be shown on the histogram.
function calculateTickStepSize(max: number, min: number): number {
    const s = (max - min) / 4; // Assuming we want 5 ticks (ish)
    if (s < 0.5) return 0.5;
    if (s < 1) return 1;
    if (s > 100) {
        const orderOfMagnitude = 10 ** Math.floor(Math.log10(s));
        return Math.round(s / orderOfMagnitude) * orderOfMagnitude;
    }
    return Math.round(s);
}

// Pretty-print a number for the chart tick labels. Again, not as polished
// as matplotlib. Apart from changing millions and thousands into 'M' and
// 'K', this also converts hyphens into proper minus signs.
//
// @param {number} value: The number to pretty-print
// @param {boolean} withSign: Whether to include a plus sign for positive
// values
export function prettyLabel(value: number, withSign: boolean = false) {
    if (typeof value === "string") return value;
    if (value === 0) return "0";
    if (value >= 1000000)
        return `${withSign ? "+" : ""}${value / 1000000}M`;
    if (value >= 1000) return `${withSign ? "+" : ""}${value / 1000}K`;
    if (value <= -1000000) return `−${Math.abs(value / 1000000)}M`;
    if (value <= -1000) return `−${Math.abs(value / 1000)}K`;
    if (value >= 0) return `${withSign ? "+" : ""}${value}`;
    return `−${Math.abs(value)}`;
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
// @returns {counts: number[]; centres: number[]} An object with fields:
//   counts - An array of length `nsteps` containing the number of values in each
//            bin (from smallest to largest).
//   centres - An array of length `nsteps` containing the centre of each bin.
export function bin(
    data: number[], min: number, max: number, nsteps: number
): { counts: number[]; centres: number[] } {
    const stepSize: number = (max - min) / nsteps;
    const counts: number[] = Array(nsteps).fill(0);
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
    const centres: number[] = Array.from({ length: nsteps }, (_, i) => min + (i + 0.5) * stepSize);

    return { counts: counts, centres: centres };
}

// Chart.js doesn't seem to export their ChartDataset type (I think).
export type ChartDataset = {
    label: string,
    data: number[],
    backgroundColor: string[] | string,
    borderWidth?: number,
    grouped?: boolean,
    order?: number,
    categoryPercentage: number,
    barPercentage: number,
    borderColor?: string,
};

export type ChartData = {
    labels: number[];
    datasets: ChartDataset[];
    tickStepSize: number;
};

// generate chart data
export function makeChartData(
    indicator: IndicatorName,
    scenarioName: string,
    compareScenarioName: string | null,
    nbars: number
): ChartData {

    if (compareScenarioName === null) {
        // Plot one dataset only (current indicator, current scenario)
        const colors: string[] = makeColormap(indicator, nbars);
        const rawValues: number[] = getValues(indicator, scenarioName);
        const bins = bin(rawValues, GLOBALMIN, GLOBALMAX, nbars);

        return {
            datasets: [
                {
                    label: getScenario(scenarioName).short,
                    data: bins.counts,
                    backgroundColor: colors,
                    borderWidth: 0,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0,
                },
            ],
            labels: bins.centres,
            tickStepSize: calculateTickStepSize(GLOBALMAX, GLOBALMIN),
        };
    }

    else {
        // Calculate the differences between the compared scenarios and plot
        // those, removing zeros
        const colors: string[] = makeColormap("diff", nbars);
        const scenValues: number[] = getValues(indicator, scenarioName);
        const cmpScenValues: number[] = getValues(indicator, compareScenarioName);
        const rawValues: number[] = scenValues.map((value, i) => value - cmpScenValues[i]).filter((value) => value !== 0);
        const max: number = Math.max(
            Math.abs(Math.min(...rawValues)),
            Math.abs(Math.max(...rawValues)),
            0.1  // deals with the case where all differences are zero
        );
        const min: number = -max;

        const bins = bin(rawValues, min, max, nbars);

        return {
            datasets: [
                {
                    label: "Difference",
                    data: bins.counts,
                    backgroundColor: colors,
                    borderWidth: 0,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0,
                },
            ],
            labels: bins.centres,
            tickStepSize: calculateTickStepSize(max, min),
        };
    }
}
