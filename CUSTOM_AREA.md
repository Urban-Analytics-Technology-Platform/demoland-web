# Adding a new area to DemoLand

New areas for DemoLand can be added by creating new subdirectories of `/areas`.

Let's say, for example, that you want to add a new area called `london`.
You will need to ensure that `/areas/london` has the following file structure:

```
areas
└── london
    ├── geo_config.json
    ├── geography.json
    └── scenarios
        ├── index.ts
        ├── baseline.json
        ├── my_other_scenario.json
        └── [... any other scenario JSON files ... ]
```

Each of these files are described further below.

## geo_config.json

`geo_config.json` must be valid JSON for an object with the keys shown below (which is taken from `areas/tyne_and_wear`).

```json
{
    "featureIdentifier": "OA11CD",
    "initialLatitude": 54.94,
    "initialLongitude": -1.59,
    "initialZoom": 10.05,
    "areaName": "Tyne and Wear",
    "modelIdentifier": "tyne_and_wear"
}
```

- `featureIdentifier`: This is the property in each GeoJSON feature which specifies the name of each area. For example, the Tyne and Wear GeoJSON looks like this. The name of each feature is specified by `feature.properties.OA11CD`, so `OA11CD` is the correct value to put in `featureIdentifier`.

   ```json
   {
       ...
       "features": [
           { "type": "Feature", "properties": { "OA11CD": "E00041363", "id": 0 }, "geometry": { "type": "Polygon", "coordinates": [ ... ] } },
           ...
       ]
   }
   ```

- `initialLatitude`, `initialLongitude`, and `initialZoom` are floats which determine the position and zoom level of the map when the website is first loaded.

- `areaName` is a string containing the name of the area. This is used for things such as the page title, so it should be a meaningful string, but otherwise there is no requirement.

- `modelIdentifier` is a specified string passed as part of HTTP requests to the backend (or Pyodide calculations). This must be set up in the `demoland-engine` repository as well, so ensure that the identifier is consistent between the two repositories.

## geography.json

This is a GeoJSON file of the area of interest.

## scenarios/index.ts

The contents of this file should obey the following structure.
If you have multiple alternative scenarios to show, you need to:

1. Import them at the top.
2. Add the imported qualifier to the `otherScenarioObjects` list at the bottom.

If you wish, you can also change the `referenceScenarioObject` to be a different scenario.
This scenario is the one against which all values are scaled.
In other words, the reference scenario is scaled such that all its values lie between 0 and 100; the same scaling factors are used for all other scenarios.

```typescript
import baseline from "./baseline.json";
import my_other_scenario from "./my_other_scenario.json";
// Import any other scenarios you want here

// List the reference scenario here. The indicator values in this scenario are
// scaled to lie between 0 and 100, and all other scenarios are scaled
// accordingly.
export const referenceScenarioObject = baseline;

// List all other scenarios here. If you do not have any other scenarios, an
// empty list suffices.
export const otherScenarioObjects = [
    my_other_scenario,
    // anything else you want here
]
```

## scenarios/\*.json

Scenario JSON files. The required schema is:

```json
{
    "metadata": {
        "name": string,
        "short": string,
        "long": string,
        "description": string
    },
    "changes": {
        area_name: {
            "signature_type": int | null,
            "use": float | null,
            "greenspace": float | null,
            "job_types": float | null
        }
    },
    "values": {
        area_name: {
            "signature_type": int,
            "air_quality": float,
            "house_price": float,
            "job_accessibility": float,
            "greenspace_accessibility": float,
        }
    }
}
```

- `metadata`: This section contains information about the scenario.
    - `metadata.name`: An identifier for the scenario. Can be anything as long as it is unique.
    - `metadata.short`: A very short title for the scenario. Used in the 'export scenario' box.
    - `metadata.long`: A title for the scenario. Used in the scenario selection dropdown and all other places (e.g. when creating a custom scenario).
    - `metadata.description`: Long, freeform text describing the scenario. Shown when the user selects a scenario.

- `changes`: This section records the changes in each area compared to the baseline.
    - The keys of the `changes` dictionary are the names of each area, as given in the GeoJSON.
    - Each area is associated with a dictionary with the keys shown above. These adhere exactly to the way scenarios are constructed in `demoland-engine` so the reader is directed there for an explanation of what the keys mean.

- `values`: This section contains the predicted values of each quality-of-life indicator, as well as the signature type. If the signature was changed (as part of the `changes` dict), then this should reflect the new value of the signature. Otherwise, this should be the signature type of the corresponding area in the baseline scenario.

The signature types are specified as integers as per the following mapping:

| Value | Name                                 |
| ----- | ------------------------------------ |
| 0     | Wild countryside                     |
| 1     | Countryside agriculture              |
| 2     | Urban buffer                         |
| 3     | Warehouse/Park land                  |
| 4     | Open sprawl                          |
| 5     | Disconnected suburbia                |
| 6     | Accessible suburbia                  |
| 7     | Connected residential neighbourhoods |
| 8     | Dense residential neighbourhoods     |
| 9     | Gridded residential quarters         |
| 10    | Dense urban neighbourhoods           |
| 11    | Local urbanity                       |
| 12    | Regional urbanity                    |
| 13    | Metropolitan urbanity                |
| 14    | Concentrated urbanity                |
| 15    | Hyper concentrated urbanity          |
