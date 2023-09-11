import { writable } from 'svelte/store';
import { type OA, type LayerName, type MacroVar, type Scenario, allLayers, GLOBALMIN, GLOBALMAX } from "src/constants";

import baselineVals from "src/assets/values/baseline.json";
import scenario1Vals from "src/assets/values/scenario1.json";
import scenario2Vals from "src/assets/values/scenario2.json";
import scenario3Vals from "src/assets/values/scenario3.json";
import scenario4Vals from "src/assets/values/scenario4.json";
import scenario5Vals from "src/assets/values/scenario5.json";
import scenario6Vals from "src/assets/values/scenario6.json";
import scenario7Vals from "src/assets/values/scenario7.json";

import scenario1Changed from "src/assets/input-changes/scenario1.json";
import scenario2Changed from "src/assets/input-changes/scenario2.json";
import scenario3Changed from "src/assets/input-changes/scenario3.json";
import scenario4Changed from "src/assets/input-changes/scenario4.json";
import scenario5Changed from "src/assets/input-changes/scenario5.json";
import scenario6Changed from "src/assets/input-changes/scenario6.json";
import scenario7Changed from "src/assets/input-changes/scenario7.json";

// Function to preprocess all raw values. Rounds to 6sf and clips negative
// values to 0. Overly precise values lead to rounding errors and spurious
// 'differences' in the map.
function preprocess(num: number): number {
    return Math.max(+num.toPrecision(6), 0);
}

/* This function reads the values from the baseline and returns a pair of
 * functions, one for scaling and one for unscaling.
 *
 * The rescaling is done by linearly interpolating between the global minimum
 * and maximum value for each indicator as found in the baseline.
 */
function getScaleFunctions(): ((layerName: LayerName, val: number) => number)[] {
    // Calculate current minimum and maximum values
    const minValues: Map<LayerName, number> = new Map();
    const maxValues: Map<LayerName, number> = new Map();
    for (const layerName of allLayers.keys()) {
        const allValues = [];
        for (const oaValues of Object.values(baselineVals)) {
            allValues.push(preprocess(oaValues[layerName]));
        }
        minValues.set(layerName, Math.min(...allValues));
        maxValues.set(layerName, Math.max(...allValues));
    }
    function rescale(layerName: LayerName, unscaledVal: number) {
        // Do NOT scale signature types - categorical variable
        if (layerName === "signature_type") {
            return unscaledVal;
        }
        else {
            const val = preprocess(unscaledVal);
            const min = minValues.get(layerName);
            const max = maxValues.get(layerName);
            return GLOBALMIN + (GLOBALMAX - GLOBALMIN) * (val - min) / (max - min);
        }
    }
    function unscale(layerName: LayerName, scaledVal: number) {
        if (layerName === "signature_type") {
            return scaledVal;
        }
        else {
            const min = minValues.get(layerName);
            const max = maxValues.get(layerName);
            return min + (max - min) * (scaledVal - GLOBALMIN) / (GLOBALMAX - GLOBALMIN);
        }
    }
    return [rescale, unscale];
}

const scaleFunctions = getScaleFunctions();
export const rescale = scaleFunctions[0];
export const unscale = scaleFunctions[1];

function setupBuiltinScenarios(): Map<string, Scenario> {
    function makeScaledValuesMapFromJson(json: object): Map<OA, Map<LayerName, number>> {
        const map = new Map<OA, Map<LayerName, number>>();
        for (const oa in json) {
            const oaMap = new Map<LayerName, number>();
            for (const layer in json[oa]) {
                oaMap.set(layer as LayerName,
                    rescale(layer as LayerName, json[oa][layer]));
            }
            map.set(oa, oaMap);
        }
        return map;
    }
    // Generate the map of input values which are changed from the baseline
    function makeChangedMapFromJson(json: object): Map<OA, Map<MacroVar, number | null>> {
        const map = new Map<OA, Map<MacroVar, number>>();
        for (const oa in json) {
            const oaMap = new Map<MacroVar, number>();
            for (const macroVar in json[oa]) {
                oaMap.set(macroVar as MacroVar, json[oa][macroVar]);
            }
            map.set(oa, oaMap);
        }
        return map;
    }

    const allBuiltinScenarios: Map<string, Scenario> = new Map([
        ["baseline", {
            "name": "baseline",
            "short": "Baseline",
            "long": "Baseline: Tyne and Wear now",
            "values": makeScaledValuesMapFromJson(baselineVals),
            "description": [
                "The baseline reflects the situation in Tyne and Wear as our models see it today. It shows what the four indicators are predicted to be using existing land use data.",
            ],
            // This is an empty value which doesn't trigger an error when calling addSource.
            "changed": makeChangedMapFromJson({}),
        }],
        ["scenario1", {
            "name": "scenario1",
            "short": "Scenario 1",
            "long": "1: Low-density residential development",
            "values": makeScaledValuesMapFromJson(scenario1Vals),
            "description": [
                "This scenario models the situation where land in the green belt is released for development. The area is taken over by a large developer used to build residential areas around the country. The new neighbourhood is a combination of low-rise detached and semi-detached housing with only minimal additional land use. The primarily residential neighbourhood does not generate a significant amount of jobs, inducing higher traffic to industrial zones and Newcastle city centre. The development is located west of the city around Callerton.",
                "The new development is modelled as a combination of <i>open sprawl</i> and <i>disconnected suburbia</i> signature types, combined with an estimation of the allocation of new population and a small number of jobs in retail and education."
            ],
            "changed": makeChangedMapFromJson(scenario1Changed),
        }],
        ["scenario2", {
            "name": "scenario2",
            "short": "Scenario 2",
            "long": "2: Mid-density mixed neighbourhood",
            "values": makeScaledValuesMapFromJson(scenario2Vals),
            "description": [
                "This scenario models the development in the green belt under the idea of a 15-minute neighbourhood that is dense, therefore taking up less space and mixed in terms of use. Such a neighbourhood contains not only residential housing but also a few places for new retail, commercial, and other uses. As such, it should be more self-sufficient than the low-density Scenario 1, inducing less traffic from the neighbourhood to other areas in the city. The development is assumed to be in the same area west of Callerton as in Scenario 1. The form is composed more of row houses and multi-story tenement buildings forming the centre of the new neighbourhood.",
                "It is modelled as a combination of <i>accessible suburbia</i>, <i>connected residential neighbourhoods</i> and <i>dense residential neighbourhoods</i> signature types, with an approximation of new population and job allocation. Land cover is changed accordingly to <i>discontinuous urban fabric</i> and <i>continuous urban fabric</i>, but on a smaller area than in Scenario 1, leaving space dedicated to large urban parks."
            ],
            "changed": makeChangedMapFromJson(scenario2Changed),
        }],
        ["scenario3", {
            "name": "scenario3",
            "short": "Scenario 3",
            "long": "3: Densification of inner city",
            "values": makeScaledValuesMapFromJson(scenario3Vals),
            "description": [
                "This densification scenario models a high-density development in the already developed areas, following the gradual infill and rebuilding existing buildings into higher ones with more mixed-use. It is a long-term strategy aimed at preserving green spaces (especially the green belt) and creating 15-minute neighbourhoods in the existing city by adding new layers of functionality and new inhabitants to places that are already built. The scenario affects most of the city, with higher densification levels around local centres and main streets and lower levels in suburban residential areas.",
                "It is modelled as a change of signature types based on their hierarchy to higher order ones and related estimations of new population and job allocation. Land cover changes from <i>discontinuous urban fabric</i> to <i>continuous urban fabric</i>."
            ],
            "changed": makeChangedMapFromJson(scenario3Changed),
        }],
        ["scenario4", {
            "name": "scenario4",
            "short": "Scenario 4",
            "long": "4: Brownfields to dense neighbourhoods",
            "values": makeScaledValuesMapFromJson(scenario4Vals),
            "description": [
                "Existing brownfield land is redeveloped into high-density neighbourhoods with mixed-use, providing housing, services, and commercial units in an attempt to densify the inner city without affecting existing areas. Compared to Scenario 3, this strategy is less invasive but has a lower scale. However, both scenarios can be potentially combined, as shown in Scenario 6.",
                "It is modelled as a change of signature types on brownfield land to <i>dense urban neighbourhoods</i> and <i>local urbanity</i>, plus relevant changes of land cover, population and job allocation."
            ],
            "changed": makeChangedMapFromJson(scenario4Changed),
        }],
        ["scenario5", {
            "name": "scenario5",
            "short": "Scenario 5",
            "long": "5: Brownfields into parks",
            "values": makeScaledValuesMapFromJson(scenario5Vals),
            "description": [
                "Contrary to Scenario 4, this scenario assumes that all the brownfield land is turned into urban parks with no development. While it does not help to solve the issue of the capacity of a city, it may be viewed favourably by the local population and can balance potential densification as outlined in Scenario 3. Both Scenarios 3 and 5 can be combined, as shown in Scenario 7.",
                "It is modelled as a change of signature types on brownfield land to <i>park/warehouse land</i> plus relevant changes of land cover, and removal of any population and job allocation."
            ],
            "changed": makeChangedMapFromJson(scenario5Changed),
        }
        ],
        ["scenario6", {
            "name": "scenario6",
            "short": "Scenario 6",
            "long": "6: Urbanisation to the edge",
            "values": makeScaledValuesMapFromJson(scenario6Vals),
            "description": [
                "This scenario models the city following the densification strategies outlined in both Scenarios 3, where we target higher density to already-dense central areas, and Scenario 4, we model the development of dense neighbourhoods in the brownfield and industrial areas around the River Tyne. As such, the scenario combines changes from Scenarios 3 and 4."
            ],
            "changed": makeChangedMapFromJson(scenario6Changed),
        }
        ],
        ["scenario7", {
            "name": "scenario7",
            "short": "Scenario 7",
            "long": "7: Urbanisation with greenery",
            "values": makeScaledValuesMapFromJson(scenario7Vals),
            "description": [
                "This scenario directs changes to two locations in two different directions. First, it assumes the densification of an already-dense city centre as outlined in Scenario 3, adding further population, jobs, and services to the area. Second, it combines this densification with the creation of new large parks around the River Tyne, where current brownfields and industrial areas are. As such, the scenario is, in principle, a combination of changes from Scenarios 3 and 5."
            ],
            "changed": makeChangedMapFromJson(scenario7Changed),
        }
        ]
    ]);
    return allBuiltinScenarios;
}

export const allScenarios = writable(setupBuiltinScenarios());
