# Adding a new area to DemoLand

New areas for DemoLand can be added by creating new subdirectories of `/areas`.
Let's say we want to add the area called `london`.
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

...

## geography.json

GeoJSON of the area of interest.

## scenarios/index.ts

The contents of this file should obey the following structure.

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
