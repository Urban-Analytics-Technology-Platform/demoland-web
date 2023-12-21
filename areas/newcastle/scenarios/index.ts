import baseline from "./baseline.json";
import scenario1 from "./scenario1.json";
import scenario2 from "./scenario2.json";
import scenario3 from "./scenario3.json";
import scenario4 from "./scenario4.json";
import scenario5 from "./scenario5.json";
import scenario6 from "./scenario6.json";
import scenario7 from "./scenario7.json";

// One of the scenarios is used as the 'reference', against which values are
// scaled.
export const referenceScenarioObject = baseline;

// List all the other scenarios here.
export const otherScenarioObjects = [
    scenario1,
    scenario1,
    scenario2,
    scenario3,
    scenario4,
    scenario5,
    scenario6,
    scenario7
]
