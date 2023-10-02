import type { ScenarioObject } from "src/constants";
import baseline from "src/data/scenarios/baseline.json";
import scenario1 from "src/data/scenarios/scenario1.json";
import scenario2 from "src/data/scenarios/scenario2.json";
import scenario3 from "src/data/scenarios/scenario3.json";
import scenario4 from "src/data/scenarios/scenario4.json";
import scenario5 from "src/data/scenarios/scenario5.json";
import scenario6 from "src/data/scenarios/scenario6.json";
import scenario7 from "src/data/scenarios/scenario7.json";

interface Config {
    featureIdentifier: string;
    initialLatitude: number;
    initialLongitude: number;
    initialZoom: number;
    referenceScenarioFile: ScenarioObject;
    otherScenarioFiles: ScenarioObject[];
}

const config: Config = {
    // GeoJSON key which gives a unique identifier for each feature. The value
    // of the identifier must be a string.
    featureIdentifier: "OA11CD",
    // Initial latitude of the map
    initialLatitude: 54.94,
    // Initial longitude of the map
    initialLongitude: -1.59,
    // Initial zoom level of the map
    initialZoom: 10.05,
    // Imported JSON object of reference scenario to scale values against
    referenceScenarioFile: baseline,
    // Imported JSON objects for all other scenarios
    otherScenarioFiles: [
        scenario1,
        scenario2,
        scenario3,
        scenario4,
        scenario5,
        scenario6,
        scenario7
    ]
};

export default config;
