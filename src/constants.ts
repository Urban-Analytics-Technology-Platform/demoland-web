import baselineVals from "./assets/baseline_prediction.json";
import scenario1Vals from "./assets/scenario1.json";
import scenario2Vals from "./assets/scenario2.json";
import scenario3Vals from "./assets/scenario3.json";
import scenario4Vals from "./assets/scenario4.json";
import scenario5Vals from "./assets/scenario5.json";
import scenario6Vals from "./assets/scenario6.json";
import scenario7Vals from "./assets/scenario7.json";

export type CompareView = "original" | "difference";

export const allCompareViews: { value: CompareView, description: string }[] = [
    { "value": "original", "description": "Original" },
    { "value": "difference", "description": "Difference" },
]

export type IndicatorName = "air_quality" | "house_price" | "job_accessibility" | "greenspace_accessibility";

export type Indicator = { name: IndicatorName, short: string, less: string, more: string };

export const allIndicators: Indicator[] = [
    {
        "name": "air_quality",
        "short": "Air quality",
        "less": "cleaner",
        "more": "more polluted",
    },
    {
        "name": "house_price",
        "short": "House prices",
        "less": "cheaper",
        "more": "more expensive",
    },
    {
        "name": "job_accessibility",
        "short": "Job accessibility",
        "less": "lower",
        "more": "higher",
    },
    {
        "name": "greenspace_accessibility",
        "short": "Greenspace accessibility",
        "less": "lower",
        "more": "higher",
    },
];

export type OA = string;

export type ScenarioName = "baseline" | "scenario1" | "scenario2" | "scenario3" | "scenario4" | "scenario5" | "scenario6" | "scenario7";

function makeValuesMapFromJson(json: object) {
    let map = new Map<OA, Map<IndicatorName, number>>();
    for (const oa in json) {
        let oaMap = new Map<IndicatorName, number>();
        for (const indicator in json[oa]) {
            oaMap.set(indicator as IndicatorName, json[oa][indicator]);
        }
        map.set(oa, oaMap);
    }
    return map;
}

export type Scenario = { name: ScenarioName, short: string, values: Map<OA, Map<IndicatorName, number>>, description: string[] };

export const allScenarios: Scenario[] = [
    {
        "name": "baseline",
        "short": "Baseline",
        "values": makeValuesMapFromJson(baselineVals),
        "description": ["Tess appeared on the threshold—not at all as he had expected to see her—bewilderingly otherwise, indeed. Her great natural beauty was, if not heightened, rendered more obvious by her attire. She was loosely wrapped in a cashmere dressing-gown of gray-white, embroidered in half-mourning tints, and she wore slippers of the same hue. Her neck rose out of a frill of down, and her well-remembered cable of dark-brown hair was partially coiled up in a mass at the back of her head and partly hanging on her shoulder—the evident result of haste.",
            "He had held out his arms, but they had fallen again to his side; for she had not come forward, remaining still in the opening of the doorway. Mere yellow skeleton that he was now, he felt the contrast between them, and thought his appearance distasteful to her.",
            "“Tess!” he said huskily, “can you forgive me for going away? Can’t you—come to me? How do you get to be—like this?”",
            "“It is too late,” said she, her voice sounding hard through the room, her eyes shining unnaturally."
        ],
    },
    {
        "name": "scenario1",
        "short": "Scenario 1",
        "values": makeValuesMapFromJson(scenario1Vals),
        "description": ["“Yes, Pip, dear boy, I’ve made a gentleman on you! It’s me wot has done it! I swore that time, sure as ever I earned a guinea, that guinea should go to you. I swore arterwards, sure as ever I spec’lated and got rich, you should get rich. I lived rough, that you should live smooth; I worked hard, that you should be above work. What odds, dear boy? Do I tell it, fur you to feel a obligation? Not a bit. I tell it, fur you to know as that there hunted dunghill dog wot you kep life in, got his head so high that he could make a gentleman,—and, Pip, you’re him!”",
            "The abhorrence in which I held the man, the dread I had of him, the repugnance with which I shrank from him, could not have been exceeded if he had been some terrible beast.",
        ],
    },
    {
        "name": "scenario2",
        "short": "Scenario 2",
        "values": makeValuesMapFromJson(scenario2Vals),
        "description": ["Mr. Rochester continued, hardily and recklessly: “Bigamy is an ugly word!—I meant, however, to be a bigamist; but fate has out-manoeuvred me, or Providence has checked me,—perhaps the last. I am little better than a devil at this moment; and, as my pastor there would tell me, deserve no doubt the sternest judgments of God, even to the quenchless fire and deathless worm. Gentlemen, my plan is broken up:—what this lawyer and his client say is true: I have been married, and the woman to whom I was married lives! You say you never heard of a Mrs. Rochester at the house up yonder, Wood; but I daresay you have many a time inclined your ear to gossip about the mysterious lunatic kept there under watch and ward. Some have whispered to you that she is my bastard half-sister: some, my cast-off mistress. I now inform you that she is my wife, whom I married fifteen years ago,—Bertha Mason by name.ˮ"],
    },
    {
        "name": "scenario3",
        "short": "Scenario 3",
        "values": makeValuesMapFromJson(scenario3Vals),
        "description": ["Mr. Rochester continued, hardily and recklessly: “Bigamy is an ugly word!—I meant, however, to be a bigamist; but fate has out-manoeuvred me, or Providence has checked me,—perhaps the last. I am little better than a devil at this moment; and, as my pastor there would tell me, deserve no doubt the sternest judgments of God, even to the quenchless fire and deathless worm. Gentlemen, my plan is broken up:—what this lawyer and his client say is true: I have been married, and the woman to whom I was married lives! You say you never heard of a Mrs. Rochester at the house up yonder, Wood; but I daresay you have many a time inclined your ear to gossip about the mysterious lunatic kept there under watch and ward. Some have whispered to you that she is my bastard half-sister: some, my cast-off mistress. I now inform you that she is my wife, whom I married fifteen years ago,—Bertha Mason by name.ˮ"],
    },
    {
        "name": "scenario4",
        "short": "Scenario 4",
        "values": makeValuesMapFromJson(scenario4Vals),
        "description": ["“What were the use of my creation, if I were entirely contained here? My great miseries in this world have been Heathcliff’s miseries, and I watched and felt each from the beginning: my great thought in living is himself. If all else perished, and he remained, I should still continue to be; and if all else remained, and he were annihilated, the universe would turn to a mighty stranger: I should not seem a part of it. My love for Linton is like the foliage in the woods: time will change it, I’m well aware, as winter changes the trees. My love for Heathcliff resembles the eternal rocks beneath: a source of little visible delight, but necessary. Nelly, I 𝑎𝑚 Heathcliff! He’s always, always in my mind: not as a pleasure, any more than I am always a pleasure to myself, but as my own being.ˮ"],
    },
    {
        "name": "scenario5",
        "short": "Scenario 5",
        "values": makeValuesMapFromJson(scenario5Vals),
        "description": ["“You know that song 'If a body catch a body comin' through the rye'? I'd like--ˮ",
            "“It's 'If a body meet a body coming through the rye'!ˮ old Phoebe said. “It's a poem. By Robert Burns.ˮ",
            "“I know it's a poem by Robert Burns.ˮ",
            "She was right, though. It is “If a body meet a body coming through the rye.ˮ I didn't know it then, though."
        ],
    },
    {
        "name": "scenario6",
        "short": "Scenario 6",
        "values": makeValuesMapFromJson(scenario6Vals),
        "description": [
            "All that had been said before had sounded so like a recantation that these words were too great a shock. Raskolnikov shuddered as though he had been stabbed.",
            "“Then... who then... is the murderer?” he asked in a breathless voice, unable to restrain himself.",
            "Porfiry Petrovitch sank back in his chair, as though he were amazed at the question.",
            "“Who is the murderer?” he repeated, as though unable to believe his ears. “Why, you, Rodion Romanovitch! You are the murderer,” he added, almost in a whisper, in a voice of genuine conviction.",
            "Raskolnikov leapt from the sofa, stood up for a few seconds and sat down again without uttering a word. His face twitched convulsively.",
        ],
    },
    {
        "name": "scenario7",
        "short": "Scenario 7",
        "values": makeValuesMapFromJson(scenario7Vals),
        "description": [
            "“You are right. It does relate to him, and I will tell you directly;” (resuming her work, and seeming resolved against looking up.) “He has been here this very morning, on a most extraordinary errand. It is impossible to express our surprize. He came to speak to his father on a subject,—to announce an attachment—”",
            "She stopped to breathe. Emma thought first of herself, and then of Harriet.",
            "“More than an attachment, indeed,” resumed Mrs. Weston; “an engagement—a positive engagement.—What will you say, Emma—what will any body say, when it is known that Frank Churchill and Miss Fairfax are engaged;—nay, that they have been long engaged!”",
        ],
    }
];

// Calculate global minimum and maximum values for each indicator
export let minValues: Map<IndicatorName, number> = new Map();
export let maxValues: Map<IndicatorName, number> = new Map();
for (const indicator of allIndicators) {
    let values: number[] = [];
    for (const scenario of allScenarios) {
        const thisScenarioValues = [...scenario.values.values()].map(v => v.get(indicator.name));
        values.push(...thisScenarioValues);
    }
    minValues.set(indicator.name, Math.min(...values));
    maxValues.set(indicator.name, Math.max(...values));
}
