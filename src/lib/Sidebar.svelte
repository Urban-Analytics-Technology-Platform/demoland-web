<script lang="ts">
    import { type Indicator } from '../indicators';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{indicatorChange: {indicator: Indicator}}>();
    function updateIndicator(event: Event) {
        dispatch('indicatorChange', {
            // TODO: Is there a way to avoid the cast?
            indicator: (event.target as HTMLInputElement).value as Indicator
        });
    }

    let allIndicators: object = {
        "air_quality": "Air quality",
        "house_price": "House prices",
        "job_accessibility": "Job accessibility",
        "greenspace_accessibility": "Greenspace accessibility"
    }
    export let currentIndicator: Indicator;
    export let indicatorValues: object | null = null;
</script>

<div id="sidebar">
    <p><strong>Land Use Demonstrator</strong></p>

    {#each Object.keys(allIndicators) as i}
        <label><input bind:group={currentIndicator} type=radio on:change={updateIndicator} value={i} />{allIndicators[i]}</label><br />
    {/each}

    <div id="values">
        {#if indicatorValues === null}
            Hover over an area to see the values...
        {:else}
            {#each Object.entries(indicatorValues) as [indi, val]}
                {#if indi === currentIndicator}
                    <b>{indi}: {val.toFixed(2)}</b><br />
                {:else}
                    {indi}: {val.toFixed(2)}<br />
                {/if}
            {/each}
        {/if}
    </div>

    <p>“In vain have I struggled. It will not do. My feelings will not be repressed. You must allow me to tell you how ardently I admire and love you.”</p>
    <p>Elizabeth’s astonishment was beyond expression. She stared, coloured, doubted, and was silent. This he considered sufficient encouragement, and the avowal of all that he felt and had long felt for her immediately followed. He spoke well; but there were feelings besides those of the heart to be detailed, and he was not more eloquent on the subject of tenderness than of pride. His sense of her inferiority, of its being a degradation, of the family obstacles which judgment had always opposed to inclination, were dwelt on with a warmth which seemed due to the consequence he was wounding, but was very unlikely to recommend his suit.</p>
</div>

<style>
div#sidebar {
    --margin: 40px;
    box-sizing: border-box;
    position: absolute;
    height: calc(100vh - (2 * var(--margin)));
    width: 300px;
    top: var(--margin);
    left: var(--margin);
    padding: 20px;
    background-color: #deb4f0;   /* purple */
    z-index: 1;
    overflow-y: scroll;
}

div#values {
    padding: 30px;
    min-height: 200px;
    max-height: 200px;
}
</style>
