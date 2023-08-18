<script lang="ts">
    export let clickedOAName: string | null;
    export let scenarioName: string;

    import { allScenarios } from "../../../scenarios";
    import { signatures, type MacroVar } from "../../../constants";

    function storeLocalChanges(map: Map<string, Map<MacroVar, number | null>>) {
        // calling JSON.stringify directly on a map-of-a-map doesn't work, so we
        // need to convert each inner map first
        const intermediateMap = new Map();
        for (const [key, value] of map.entries()) {
            intermediateMap.set(key, [...value.entries()]);
        }
        localStorage.setItem(
            "changed",
            JSON.stringify([...intermediateMap.entries()])
        );
    }
    function getLocalChanges(): Map<string, Map<MacroVar, number | null>> {
        const stringified = localStorage.getItem("changed");
        if (stringified === null) {
            return new Map();
        } else {
            const intermediateMap = new Map(JSON.parse(stringified));
            const map = new Map();
            for (const [key, val] of intermediateMap.entries()) {
                // @ts-ignore Cannot prove deserialisation is safe
                map.set(key, new Map(val));
            }
            return map;
        }
    }
    function getOAChanges(oaName: string): Map<MacroVar, number | null> {
        const changes = getLocalChanges();
        if (changes.has(oaName)) {
            return changes.get(oaName);
        } else {
            return new Map([
                ["signature_type", null],
                ["job_types", null],
                ["use", null],
                ["greenspace", null],
            ]);
        }
    }
    function updateOAChanges(
        oaName: string,
        sig: number | null,
        job: number | null,
        use: number | null,
        green: number | null
    ) {
        const allChanges = getLocalChanges();
        const thisChanges: Map<MacroVar, number | null> = new Map([
            ["signature_type", sig],
            ["job_types", job],
            ["use", use],
            ["greenspace", green],
        ]);
        allChanges.set(oaName, thisChanges);
        console.log(allChanges);
        storeLocalChanges(allChanges);
    }

    // Load current scenario into local storage
    storeLocalChanges($allScenarios.get(scenarioName).changed);

    let oaChanges: Map<MacroVar, number | null> = null;
    let sig: number | null = null;
    let sigModified: boolean;
    let job: number | null = null;
    let use: number | null = null;
    let green: number | null = null;
    $: {
        if (clickedOAName === null) {
            sig = null;
            job = null;
            use = null;
            green = null;
        } else {
            oaChanges = getOAChanges(clickedOAName);
            sigModified = oaChanges.get("signature_type") !== null;
            sig = sigModified
                ? oaChanges.get("signature_type")  // Get from localStorage
                : $allScenarios                    // Get from existing scenario
                      .get(scenarioName)
                      .values.get(clickedOAName)
                      .get("signature_type");
            job = oaChanges.get("job_types");
            use = oaChanges.get("use");
            green = oaChanges.get("greenspace");
        }
    }
</script>

<h3>Step 2: modify output areas</h3>

<p>
    Currently selected OA: {clickedOAName === "null" ? "none" : clickedOAName}
</p>

<div id="changes-grid">
    <label for="sig">Signature type</label>
    <input
        type="checkbox"
        id="sig"
        bind:checked={sigModified}
        on:click={() =>
            updateOAChanges(
                clickedOAName,
                sigModified ? sig : null,
                job,
                use,
                green
            )}
    />
    <select
        id="sig"
        bind:value={sig}
        disabled={!sigModified}
        on:change={() =>
            updateOAChanges(
                clickedOAName,
                sigModified ? sig : null,
                job,
                use,
                green
            )}
    >
        {#each [...signatures.entries()] as [sigId, sig]}
            <option value={sigId}>{sigId}: {sig.name}</option>
        {/each}
    </select>
</div>

<style>
    h3 {
        font-size: 100%;
        font-weight: bold;
    }

    div#changes-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
    }
</style>
