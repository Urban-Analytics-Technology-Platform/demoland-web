<script lang="ts">
    import {
        allIndicators,
        type FactorName,
        type ScenarioName,
        type CompareView,
    } from "../constants";
    export let feature: GeoJSON.Feature | undefined;
    export let activeFactor: FactorName;
    export let compareScenarioName: ScenarioName | null;
    export let compareView: CompareView;

    let oaName: string;

    function getText(indicator: FactorName): string {
        function boldIf(p: boolean, s: string): string {
            return p ? `<b>${s}</b>` : s;
        }
        const origVal = feature.properties[indicator];
        const cmpVal = feature.properties[`${indicator}-cmp`];

        let val = compareView === "original" || compareView === "difference" ? origVal : cmpVal;
        let otherVal = compareView === "original" || compareView === "difference" ? cmpVal : origVal;
        if (compareScenarioName === null) {
            return boldIf(indicator === activeFactor, val.toFixed(2));
        } else {
            const pctChange =
                cmpVal === 0 ? 0 : (100 * (origVal - cmpVal)) / cmpVal;
            const sign = pctChange >= 0 ? "+" : "−"; // this is a minus sign instead of hyphen!
            return (
                boldIf(
                    indicator === activeFactor &&
                        (compareView === "original" || compareView === "other"),
                    val.toFixed(2)
                ) +
                " " +
                boldIf(
                    indicator === activeFactor &&
                        compareView === "difference",
                    `(${sign}${Math.abs(pctChange).toFixed(1)}%)`
                )
            );
        }
    }

    let texts = new Map();
    for (const indi of allIndicators) {
        texts.set(indi.name, getText(indi.name));
    }

    $: {
        feature, activeFactor, compareView;
        oaName = feature.properties.OA11CD;
        for (const indi of allIndicators) {
            texts.set(indi.name, getText(indi.name));
        }
        texts = texts;
    }
</script>

{#if feature !== null}
    <div id="values">
        <h2>Output area: {feature.properties.OA11CD}</h2>

        {#each allIndicators as indi}
            <div class="nomargin"><i>{indi.short}</i></div>
            <div class="nomargin ralign">{@html texts.get(indi.name)}</div>
        {/each}
    </div>
{/if}

<style>
    div#values {
        border-radius: 10px;
        opacity: 90%;
        box-sizing: border-box;
        padding: 20px;
        background-color: #ffffff;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
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
