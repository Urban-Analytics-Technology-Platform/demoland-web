<script lang="ts">
    import {
        allIndicators,
        type FactorName,
        type ScenarioName,
        type CompareView,
        signatures,
        signaturesUrl,
    } from "../constants";
    export let feature: GeoJSON.Feature | undefined;
    export let activeFactor: FactorName;
    export let compareScenarioName: ScenarioName | null;
    export let compareView: CompareView;

    function getText(indicator: FactorName): string {
        function boldIf(p: boolean, s: string): string {
            return p ? `<b>${s}</b>` : s;
        }
        const val = feature.properties[indicator];
        const cmpVal = feature.properties[`${indicator}-cmp`];

        if (compareScenarioName === null) {
            return boldIf(indicator === activeFactor, val.toFixed(2));
        } else {
            const pctChange =
                cmpVal === 0 ? 0 : (100 * (val - cmpVal)) / cmpVal;
            const sign = pctChange >= 0 ? "+" : "−"; // this is a minus sign instead of hyphen!
            return (
                boldIf(
                    indicator === activeFactor && compareView === "original",
                    val.toFixed(2)
                ) +
                " " +
                boldIf(
                    indicator === activeFactor && compareView === "difference",
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
        for (const indi of allIndicators) {
            texts.set(indi.name, getText(indi.name));
        }
        texts = texts;
    }
</script>

{#if feature !== null}
    <div id="values">
        <div>
            <i>Land use signature</i>
            <a href={signaturesUrl} target="_blank">[?]</a>
        </div>
        <div class="ralign">{signatures[feature.properties.sig].name}</div>
        {#each allIndicators as indi}
            <div><i>{indi.short}</i></div>
            <!-- eslint-disable-next-line -->
            <div class="ralign">{@html texts.get(indi.name)}</div>
        {/each}
    </div>
{/if}

<style>
    div#values > :first-child {
        margin-top: 0 !important;
    }
    div#values > :last-child {
        margin-bottom: 0 !important;
    }

    div.ralign {
        text-align: right;
        margin-bottom: 5px;
    }
</style>
