import baselineVals from "./assets/baseline_prediction.json";
import scenario1Vals from "./assets/scenario1.json";
import scenario2Vals from "./assets/scenario2.json";
import scenario3Vals from "./assets/scenario3.json";
import scenario4Vals from "./assets/scenario4.json";
import scenario5Vals from "./assets/scenario5.json";
import scenario6Vals from "./assets/scenario6.json";
import scenario7Vals from "./assets/scenario7.json";

export type CompareView = "original" | "difference";

export type IndicatorName = "air_quality" | "house_price" | "job_accessibility" | "greenspace_accessibility";

export type Indicator = { name: IndicatorName, short: string, less: string, more: string, less_diff: string, more_diff: string };

export const allIndicators: Indicator[] = [
    {
        "name": "air_quality",
        "short": "Air pollution",
        "less": "cleaner",
        "more": "more polluted",
        "less_diff": "improved",
        "more_diff": "worsened",
    },
    {
        "name": "house_price",
        "short": "House prices",
        "less": "cheaper",
        "more": "more expensive",
        "less_diff": "decreased",
        "more_diff": "increased",
    },
    {
        "name": "job_accessibility",
        "short": "Job accessibility",
        "less": "lower",
        "more": "higher",
        "less_diff": "decreased",
        "more_diff": "increased",
    },
    {
        "name": "greenspace_accessibility",
        "short": "Greenspace accessibility",
        "less": "lower",
        "more": "higher",
        "less_diff": "decreased",
        "more_diff": "increased",
    },
];

export type FactorName = IndicatorName | "sig";

export type Factor = { name: FactorName, short: string };

export const allFactors = [...allIndicators] as Factor[];
allFactors.unshift({ "name": "sig", "short": "Land use" });
// must add to the front so that the radio button appears first

export type OA = string;

export type ScenarioName = "baseline" | "scenario1" | "scenario2" | "scenario3" | "scenario4" | "scenario5" | "scenario6" | "scenario7";

export type Scenario = { name: ScenarioName, short: string, long: string, values: Map<OA, Map<FactorName, number>>, description: string[] };

// Range to scale all indicator values to
export const GLOBALMIN = 0;
export const GLOBALMAX = 100;

function setupScenarios(globalMin: number, globalMax: number): Scenario[] {
    // Generate a Map containing all unscaled values from a JSON file
    function makeValuesMapFromJson(json: object): Map<OA, Map<FactorName, number>> {
        const map = new Map<OA, Map<FactorName, number>>();
        for (const oa in json) {
            const oaMap = new Map<FactorName, number>();
            for (const indicator in json[oa]) {
                oaMap.set(indicator as IndicatorName, json[oa][indicator]);
            }
            oaMap.set("sig", json[oa]["sig"]);
            map.set(oa, oaMap);
        }
        return map;
    }

    const allScenarios: Scenario[] = [
        {
            "name": "baseline",
            "short": "Baseline",
            "long": "Tyne and Wear today",
            "values": makeValuesMapFromJson(baselineVals),
            "description": [
                "The baseline reflects the situation in Tyne and Wear as our models see it today. It shows what the four indicators are predicted to be using existing land use data.",
                `All indicator values range from ${GLOBALMIN} to ${GLOBALMAX}.`,
                "Select a development scenario above and compare it against the baseline to see the impact of the modelled development strategies on any of the four indicators."
            ],
        },
        {
            "name": "scenario1",
            "short": "Scenario 1",
            "long": "Scenario 1: low-density residential development",
            "values": makeValuesMapFromJson(scenario1Vals),
            "description": [
                "This scenario models the situation where land in the green belt is released for development. The area is taken over by a large developer who is used to building residential areas around the country. The new neighbourhood is a combination of low-rise detached and semi-detached housing with only minimal additional land use. The primarily residential neighbourhood does not generate a significant amount of jobs, inducing higher traffic to industrial zones and Newcastle city centre. The development will be located west of the city around Callerton.",
                "The new development will be modelled as a combination of <i>open sprawl</i> and <i>disconnected suburbia</i> signature types, combined with an estimation of allocation of new population and a small number of jobs in retail and education. Land cover will be changed accordingly to primarily <i>discontinuous urban fabric</i>."
            ],
        },
        {
            "name": "scenario2",
            "short": "Scenario 2",
            "long": "Scenario 2: mid-density mixed neighbourhood",
            "values": makeValuesMapFromJson(scenario2Vals),
            "description": [
                "This scenario models the development in the green belt under the idea of a 15-minute neighbourhood that is dense, therefore taking up less space, and mixed in terms of use. Such a neighbourhood contains not only residential housing but also places for new retail, commercial, and other uses. As such, it should be more self-sufficient than the low-density Scenario 1, inducing less traffic from the neighbourhood to other areas in the city. The development is assumed to be in the same area west of Callerton, as in Scenario 1. The form will be composed more of row-houses and multi-story tenement buildings forming the centre of the new neighbourhood.",
                "It will be modelled as a combination of <i>accessible suburbia</i>, <i>connected residential neighbourhoods</i> and <i>dense residential neighbourhoods</i> signature types, with approximation of new population and job allocation. Land cover will be changed accordingly to <i>discontinuous urban fabric</i> and <i>continuous urban fabric</i>, but on a smaller area than in Scenario 1."
            ],
        },
        {
            "name": "scenario3",
            "short": "Scenario 3",
            "long": "Scenario 3: densification of inner city",
            "values": makeValuesMapFromJson(scenario3Vals),
            "description": [
                "This densification scenario models a high-density development in the areas that are already developed, following the strategy of gradual infill and rebuilding of existing buildings into higher ones with more mixed use. It is a long-term strategy, aimed at preservation of green areas (especially the green belt) and the creation of 15-minute neighbourhoods in the existing city by adding new layers of functionality and new inhabitants to places that are already built. The scenario affects most of the city, with higher densification levels around local centres and main streets and lower levels in suburban residential areas.",
                "It will be modelled as a change of signature types based on their hierarchy to higher order ones and related estimations of new population and job allocation. Land cover will likely see changes from <i>discontinuous urban fabric</i> to <i>continuous urban fabric</i>."
            ],
        },
        {
            "name": "scenario4",
            "short": "Scenario 4",
            "long": "Scenario 4: brownfields to dense neighbourhoods",
            "values": makeValuesMapFromJson(scenario4Vals),
            "description": [
                "Existing brownfield land will be redeveloped into high-density neighbourhoods with a mixed use, providing housing, services, and commercial units in an attempt to densify the inner city without affecting existing areas. Compared to Scenario 3, this strategy is less invasive but has a lower scale. However, both scenarios can potentially combined together (as shown in Scenario 6).",
                "It will be modelled as a change of signature types on brownfield land to <i>dense urban neighbourhoods</i> and <i>local urbanity</i>, plus relevant changes of land cover, population and job allocation."
            ],
        },
        {
            "name": "scenario5",
            "short": "Scenario 5",
            "long": "Scenario 5: brownfields into parks",
            "values": makeValuesMapFromJson(scenario5Vals),
            "description": [
                "Contrary to Scenario 4, this scenario assumes that all the brownfield land will be turned into urban parks, with no development. While it does not help to solve the issue of capacity of a city, it may be viewed favourably by the local population and can balance potential densification as outlined in Scenario 3. Both Scenarios 3 and 5 can be combined, as shown in Scenario 7.",
                "It will be modelled as a change of signature types on brownfield land to <i>park/warehouse land</i> plus relevant changes of land cover, and removal of any population and job allocation."
            ],
        },
        {
            "name": "scenario6",
            "short": "Scenario 6",
            "long": "Scenario 6: urbanisation to the edge",
            "values": makeValuesMapFromJson(scenario6Vals),
            "description": [
                "This scenario models the city following the densification strategies outlined in both Scenarios 3, where we target higher density to already-dense central areas, and Scenario 4, we we model the development of dense neighbourhoods in the brownfield and industrial areas around the River Tyne. As such, the scenario is in principle a combination of changes from Scenarios 3 and 4."
            ],
        },
        {
            "name": "scenario7",
            "short": "Scenario 7",
            "long": "Scenario 7: urbanisation with greenery",
            "values": makeValuesMapFromJson(scenario7Vals),
            "description": [
                "This scenario directs changes to two locations, in two different directions. First, it assumes a densification of an already-dense city centre as outlined in Scenario 3, adding further population, jobs, and services to the area. Second, it combines this densification with the creation of new large parks around the River Tyne, where current brownfields and industrial areas are. As such, the scenario is in principle a combination of changes from Scenarios 3 and 5."
            ],
        }
    ];

    // Calculate current maximum values
    const minValues: Map<IndicatorName, number> = new Map();
    const maxValues: Map<IndicatorName, number> = new Map();
    for (const indicator of allIndicators) {
        const values: number[] = [];
        for (const scenario of allScenarios) {
            const thisScenarioValues = [...scenario.values.values()].map(v => v.get(indicator.name));
            values.push(...thisScenarioValues);
        }
        minValues.set(indicator.name, Math.min(...values));
        maxValues.set(indicator.name, Math.max(...values));
    }

    // Rescale the values in each scenario
    for (const scenario of allScenarios) {
        for (const vals of scenario.values.values()) {
            for (const indicator of allIndicators) {
                const val = vals.get(indicator.name);
                const min = minValues.get(indicator.name);
                const max = maxValues.get(indicator.name);
                const scaledVal = globalMin + ((globalMax - globalMin) * (val - min) / (max - min));
                vals.set(indicator.name, scaledVal);
            }
        }
    }
    return allScenarios;
}

export const allScenarios = setupScenarios(GLOBALMIN, GLOBALMAX);

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

export const signaturesUrl: string = "https://urbangrammarai.xyz/story/#ss"
