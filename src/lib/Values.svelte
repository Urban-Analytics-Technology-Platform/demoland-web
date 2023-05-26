<script lang="ts">
    import {
        allIndicators,
        type IndicatorName,
        type ScenarioName,
        type CompareView,
    } from "../constants";
    export let feature: GeoJSON.Feature | undefined;
    export let activeIndicator: IndicatorName;
    export let compareScenarioName: ScenarioName | null;
    export let compareView: CompareView;

    let oaName: string;

    function getText(
        indicator: IndicatorName,
    ): string {
        function boldIf(p: boolean, s: string): string {
            return p ? `<b>${s}</b>` : s;
        }
        let val = feature.properties[indicator];
        let cmpVal = feature.properties[`${indicator}-cmp`];
        if (compareScenarioName === null) {
            return boldIf(indicator === activeIndicator, val.toFixed(2));
        } else {
            const pctChange =
                cmpVal === 0 ? 0 : (100 * (val - cmpVal)) / cmpVal;
            const sign = pctChange >= 0 ? "+" : "−"; // this is a minus sign instead of hyphen!
            return (
                boldIf(
                    indicator === activeIndicator && compareView === "original",
                    val.toFixed(2)
                ) +
                " " +
                boldIf(
                    indicator === activeIndicator &&
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
        feature, activeIndicator, compareView;
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
