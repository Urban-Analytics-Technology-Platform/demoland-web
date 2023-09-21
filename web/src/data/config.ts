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
    referenceScenarioFile: "src/data/scenarios/baseline.json",
    // File names of other scenarios
    otherScenarioFiles: [
        "src/data/scenarios/scenario1.json",
        "src/data/scenarios/scenario2.json",
        "src/data/scenarios/scenario3.json",
        "src/data/scenarios/scenario4.json",
        "src/data/scenarios/scenario5.json",
        "src/data/scenarios/scenario6.json",
        "src/data/scenarios/scenario7.json",
    ]
};

export default config;
