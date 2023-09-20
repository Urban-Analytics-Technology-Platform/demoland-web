interface Config {
    featureIdentifier: string;
    initialLatitude: number;
    initialLongitude: number;
    initialZoom: number;
    referenceScenarioFile: string;
    otherScenarioFiles: string[];
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
    // File name of reference scenario to scale values against
    referenceScenarioFile: "src/data/scenarios/baseline.scenario.zip",
    // File names of other scenarios
    otherScenarioFiles: [
        "src/data/scenarios/scenario1.scenario.zip",
        "src/data/scenarios/scenario2.scenario.zip",
        "src/data/scenarios/scenario3.scenario.zip",
        "src/data/scenarios/scenario4.scenario.zip",
        "src/data/scenarios/scenario5.scenario.zip",
        "src/data/scenarios/scenario6.scenario.zip",
        "src/data/scenarios/scenario7.scenario.zip",
    ]
};

export default config;
