<script lang="ts">
    import { allIndicators, type Indicator } from "../indicators";
    export let currentIndicator: Indicator;
    export let values: object | null = null;
</script>

{#if values !== null}
    <div id="values">
        <h2>Output area: {values["OA11CD"]}</h2>
        {#each allIndicators as indi}
            {#if indi === currentIndicator}
                <span
                    style={"font-weight: bold; color: " +
                        values[`${indi}-color`]}
                    >{indi}: {values[indi].toFixed(2)}</span
                ><br />
            {:else}
                {indi}: {values[indi].toFixed(2)}<br />
            {/if}
        {/each}
    </div>
{/if}

<style>
    div#values {
        border-radius: 10px;
        opacity: 90%;
        box-sizing: border-box;
        height: min-content;
        width: 300px;
        top: var(--margin);
        right: var(--margin);
        padding: 20px;
        background-color: #cbf5da; /* light green */
        border: 1px solid black;
        margin-bottom: 20px;
        padding: 20px;
    }

    div#values > :first-child {
        margin-top: 0 !important;
    }
    div#values > :last-child {
        margin-bottom: 0 !important;
    }
</style>
