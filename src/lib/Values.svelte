<script lang="ts">
    import {
        allIndicators,
        type IndicatorName,
        type ScenarioName,
    } from "../constants";
    export let feature: GeoJSON.Feature | undefined;
    export let compareScenarioName: ScenarioName | null;

    function getText(n: IndicatorName, csn: ScenarioName | null): string {
        let val = feature.properties[n];
        let cmpVal = feature.properties[`${n}-cmp`];
        if (csn === null) {
            return val.toFixed(2);
        } else {
            const pctChange =
                cmpVal === 0 ? 0 : (100 * (val - cmpVal)) / cmpVal;
            const sign = pctChange >= 0 ? "+" : "";
            return `${val.toFixed(2)} (${sign}${pctChange.toFixed(1)}%)`;
        }
    }

    let texts = new Map();
    for (const indi of allIndicators) {
        texts.set(indi.name, getText(indi.name, compareScenarioName));
    }

    // Rather awkward way of forcing component to be reactive. Can this be
    // improved on?
    $: {
        feature = feature; // forces entire block to be run whenever feature is changed
        feature.properties.OA11CD = feature.properties.OA11CD;
        for (const indi of allIndicators) {
            texts.set(indi.name, getText(indi.name, compareScenarioName));
        }
        texts = texts;
    }
</script>

{#if feature !== null}
    <div id="values">
        <h2>Output area: {feature.properties.OA11CD}</h2>

        {#each allIndicators as indi}
            <div class="nomargin"><i>{indi.short}</i></div>
            <div class="nomargin ralign">{texts.get(indi.name)}</div>
        {/each}
    </div>
{/if}

<style>
    div#values {
        border-radius: 10px;
        opacity: 90%;
        box-sizing: border-box;
        padding: 20px;
        background-color: #cbf5da; /* light green */
        border: 1px solid black;
        pointer-events: auto;
    }

    div#values > :first-child {
        margin-top: 0 !important;
    }
    div#values > :last-child {
        margin-bottom: 0 !important;
    }

    div.nomargin {
        margin-top: 0;
        margin-bottom: 0;
    }

    div.ralign {
        text-align: right;
    }
</style>
