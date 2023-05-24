import baselineVals from "./assets/baseline_oa.json";
import scenario1Vals from "./assets/scenario1_oa.json";
import scenario2Vals from "./assets/scenario2_oa.json";

export type IndicatorName = "air_quality" | "house_price" | "job_accessibility" | "greenspace_accessibility";

export type Indicator = {name: IndicatorName, short: string, less: string, more: string};

export let allIndicators: Indicator[] = [
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


export type ScenarioName = "baseline" | "scenario1" | "scenario2";

export type Scenario = { name: ScenarioName, short: string, values: object, description: string[] };

export let allScenarios: Scenario[] = [
    {
        "name": "baseline",
        "short": "Baseline",
        "values": baselineVals,
        "description": ["Tess appeared on the threshold—not at all as he had expected to see her—bewilderingly otherwise, indeed. Her great natural beauty was, if not heightened, rendered more obvious by her attire. She was loosely wrapped in a cashmere dressing-gown of gray-white, embroidered in half-mourning tints, and she wore slippers of the same hue. Her neck rose out of a frill of down, and her well-remembered cable of dark-brown hair was partially coiled up in a mass at the back of her head and partly hanging on her shoulder—the evident result of haste.",
            "He had held out his arms, but they had fallen again to his side; for she had not come forward, remaining still in the opening of the doorway. Mere yellow skeleton that he was now, he felt the contrast between them, and thought his appearance distasteful to her.",
            "“Tess!” he said huskily, “can you forgive me for going away? Can’t you—come to me? How do you get to be—like this?”",
            "“It is too late,” said she, her voice sounding hard through the room, her eyes shining unnaturally."
        ],
    },
    {
        "name": "scenario1",
        "short": "Scenario 1",
        "values": scenario1Vals,
        "description": ["“Yes, Pip, dear boy, I’ve made a gentleman on you! It’s me wot has done it! I swore that time, sure as ever I earned a guinea, that guinea should go to you. I swore arterwards, sure as ever I spec’lated and got rich, you should get rich. I lived rough, that you should live smooth; I worked hard, that you should be above work. What odds, dear boy? Do I tell it, fur you to feel a obligation? Not a bit. I tell it, fur you to know as that there hunted dunghill dog wot you kep life in, got his head so high that he could make a gentleman,—and, Pip, you’re him!”",
            "The abhorrence in which I held the man, the dread I had of him, the repugnance with which I shrank from him, could not have been exceeded if he had been some terrible beast.",
        ],
    },
    {
        "name": "scenario2",
        "short": "Scenario 2",
        "values": scenario2Vals,
        "description": ["Mr. Rochester continued, hardily and recklessly: “Bigamy is an ugly word!—I meant, however, to be a bigamist; but fate has out-manoeuvred me, or Providence has checked me,—perhaps the last. I am little better than a devil at this moment; and, as my pastor there would tell me, deserve no doubt the sternest judgments of God, even to the quenchless fire and deathless worm. Gentlemen, my plan is broken up:—what this lawyer and his client say is true: I have been married, and the woman to whom I was married lives! You say you never heard of a Mrs. Rochester at the house up yonder, Wood; but I daresay you have many a time inclined your ear to gossip about the mysterious lunatic kept there under watch and ward. Some have whispered to you that she is my bastard half-sister: some, my cast-off mistress. I now inform you that she is my wife, whom I married fifteen years ago,—Bertha Mason by name.ˮ"],
    },
];
