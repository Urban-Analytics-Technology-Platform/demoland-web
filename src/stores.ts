import { writable } from 'svelte/store';
import { type OA, type LayerName, type IndicatorName, type MacroVar, type Scenario, allIndicators, GLOBALMIN, GLOBALMAX } from "./constants";

import baselineVals from "./assets/values/baseline.json";
import scenario1Vals from "./assets/values/scenario1.json";
import scenario2Vals from "./assets/values/scenario2.json";
import scenario3Vals from "./assets/values/scenario3.json";
import scenario4Vals from "./assets/values/scenario4.json";
import scenario5Vals from "./assets/values/scenario5.json";
import scenario6Vals from "./assets/values/scenario6.json";
import scenario7Vals from "./assets/values/scenario7.json";

import scenario1Changed from "./assets/input-changes/scenario1.json";
import scenario2Changed from "./assets/input-changes/scenario2.json";
import scenario3Changed from "./assets/input-changes/scenario3.json";
import scenario4Changed from "./assets/input-changes/scenario4.json";
import scenario5Changed from "./assets/input-changes/scenario5.json";
import scenario6Changed from "./assets/input-changes/scenario6.json";
import scenario7Changed from "./assets/input-changes/scenario7.json";

function setupBuiltinScenarios(globalMin: number, globalMax: number): Map<string, Scenario> {
    // Generate a Map containing all unscaled values from a JSON file
    function makeValuesMapFromJson(json: object): Map<OA, Map<LayerName, number>> {
        const map = new Map<OA, Map<LayerName, number>>();
        for (const oa in json) {
            const oaMap = new Map<LayerName, number>();
            for (const indicator in json[oa]) {
                const val = Math.max(json[oa][indicator], 0);
                oaMap.set(indicator as IndicatorName, val);
            }
            oaMap.set("signature_type", json[oa]["signature_type"]);
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
            "values": makeValuesMapFromJson(baselineVals),
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
            "values": makeValuesMapFromJson(scenario1Vals),
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
            "values": makeValuesMapFromJson(scenario2Vals),
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
            "values": makeValuesMapFromJson(scenario3Vals),
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
            "values": makeValuesMapFromJson(scenario4Vals),
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
            "values": makeValuesMapFromJson(scenario5Vals),
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
            "values": makeValuesMapFromJson(scenario6Vals),
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
            "values": makeValuesMapFromJson(scenario7Vals),
            "description": [
                "This scenario directs changes to two locations in two different directions. First, it assumes the densification of an already-dense city centre as outlined in Scenario 3, adding further population, jobs, and services to the area. Second, it combines this densification with the creation of new large parks around the River Tyne, where current brownfields and industrial areas are. As such, the scenario is, in principle, a combination of changes from Scenarios 3 and 5."
            ],
            "changed": makeChangedMapFromJson(scenario7Changed),
        }
        ]
    ]);

    // Calculate current minimum and maximum values
    const minValues: Map<IndicatorName, number> = new Map();
    const maxValues: Map<IndicatorName, number> = new Map();
    for (const indiName of allIndicators.keys()) {
        const values: number[] = [];
        for (const scenario of allBuiltinScenarios.values()) {
            const thisScenarioValues = [...scenario.values.values()].map(v => v.get(indiName));
            values.push(...thisScenarioValues);
        }
        minValues.set(indiName, Math.min(...values));
        maxValues.set(indiName, Math.max(...values));
    }

    // Rescale the values in each scenario
    for (const scenario of allBuiltinScenarios.values()) {
        for (const vals of scenario.values.values()) {
            for (const indiName of allIndicators.keys()) {
                const val = vals.get(indiName);
                const min = minValues.get(indiName);
                const max = maxValues.get(indiName);
                const scaledVal = globalMin + ((globalMax - globalMin) * (val - min) / (max - min));
                vals.set(indiName, scaledVal);
            }
        }
    }
    return allBuiltinScenarios;
}

export const allScenarios = writable(setupBuiltinScenarios(GLOBALMIN, GLOBALMAX));