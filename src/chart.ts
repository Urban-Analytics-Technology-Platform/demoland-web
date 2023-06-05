import {
    type IndicatorName,
    allScenarios,
    type ScenarioName,
    minValues,
    maxValues,
    type CompareView
} from "./constants";
import { getValues, makeColormap } from "./utils";

// Automatically calculate a suitable tick step size for a histogram. Chart.js's
// automatic calculation is not quite as polished as matplotlib.
//
// @param {number} max - The maximum value to be shown on the histogram.
// @param {number} min - The minimum value to be shown on the histogram.
function calculateTickStepSize(max: number, min: number): number {
    const s = (max - min) / 4; // Assuming we want 5 ticks (ish)
    if (s < 0.5) return 0.5;
    if (s < 1) return 1;
    if (s > 10) {
        const orderOfMagnitude = 10 ** Math.floor(Math.log10(s));
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
        const colors: string[] = makeColormap(indicator, nbars);
        const rawValues: number[] = getValues(indicator, scenarioName);
        const min: number = minValues.get(indicator);
        const max: number = maxValues.get(indicator);
        const bins = bin(rawValues, min, max, nbars);

        return {
            datasets: [
                {
                    label: getScenarioShort(scenarioName),
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

    else {

        if (compareView === "original") {
            // Plot two datasets (current indicator, current scenario, other
            // scenario))
            const colors: string[] = makeColormap(indicator, nbars);
            const rawValues: number[] = getValues(indicator, scenarioName);
            const cmpRawValues: number[] = getValues(indicator, compareScenarioName);
            const min: number = minValues.get(indicator);
            const max: number = maxValues.get(indicator);
            const bins = bin(rawValues, min, max, nbars);
            const cmpBins = bin(cmpRawValues, min, max, nbars);

            return {
                datasets: [
                    {
                        label: getScenarioShort(compareScenarioName),
                        data: cmpBins.counts,
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
                        data: bins.counts,
                        backgroundColor: colors,
                        borderWidth: 0,
                        grouped: false,
                        order: 2,
                        categoryPercentage: 1.0,
                        barPercentage: 1.0,
                    },
                ],
                labels: bins.centres,
                tickStepSize: calculateTickStepSize(max, min),
            };
        }

        else if (compareView === "other") {
            // swap scenario with compareScenario and call again
            return makeChartData(indicator, "original", compareScenarioName, scenarioName, nbars);
        }

        else if (compareView === "difference") {
            // Calculate the differences between the compared scenarios and plot those
            const colors: string[] = makeColormap("diff", nbars);
            const scenValues: number[] = getValues(indicator, scenarioName);
            const cmpScenValues: number[] = getValues(indicator, compareScenarioName);
            const rawValues: number[] = scenValues.map((value, i) => value - cmpScenValues[i]);
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
}
