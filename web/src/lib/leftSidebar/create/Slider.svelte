<script lang="ts">
    import { onMount } from "svelte";
    export let modified: boolean;
    export let value: number | null;
    export let title: string;
    export let defaultVal: number; // Number shown when slider is activated
    export let leftEdge: number; // The number that the left edge of the div represents.
    export let rightEdge: number; // The number that the right edge of the div represents.
    export let min: number; // Minimum valid value for slider
    export let max: number; // Maximum valid value for slider
    export let step: number;

    let container: HTMLElement;
    let slider: HTMLInputElement;

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    function setContainerPadding() {
        const paddingLeft = ((min - leftEdge) / (rightEdge - leftEdge)) * 100;
        const paddingRight = ((rightEdge - max) / (rightEdge - leftEdge)) * 100;
        container.style.paddingLeft = `${paddingLeft}px`;
        container.style.paddingRight = `${paddingRight}px`;
        container.style.width = "104px";
    }

    function setSliderWidthAndValue() {
        const sliderWidth = ((max - min) / (rightEdge - leftEdge)) * 100;
        slider.style.width = `${sliderWidth}px`;
    }

    const idTitle = title.replace(/\s/g, "-").toLowerCase();

    function dispatchChange() {
        dispatch("change", {});
    }

    onMount(() => {
        if (!modified) {
            value = defaultVal;
        }
    });

    $: {
        // Update the slider width and container padding when any of the
        // parameters change (in effect, when the underlying signature type
        // changes)
        min, max, leftEdge, rightEdge, defaultVal;
        if (container && slider) {
            setContainerPadding();
            setSliderWidthAndValue();
        }
    }
</script>

<label for="{idTitle}-modified">{title}</label>
<input
    type="checkbox"
    id="{idTitle}-modified"
    bind:checked={modified}
    on:change={() => {
        value = defaultVal;
        dispatchChange();
    }}
/>
{#if modified && value !== null}
    <div bind:this={container}>
        <input
            type="range"
            class="range"
            bind:this={slider}
            bind:value
            on:change={dispatchChange}
            {min}
            {max}
            {step}
        />
    </div>
    <input
        type="number"
        class="value"
        bind:value
        on:focusout={() => {
            if (value > max) {
                value = max;
            } else if (value < min) {
                value = min;
            }
        }}
        on:change={() => {
            if (value > max) {
                value = max;
            } else if (value < min) {
                value = min;
            } else if (value === null) {
                value = defaultVal;
            }
            dispatchChange();
        }}
        {min}
        {max}
        {step}
    />
{:else}
    <div bind:this={container}>
        <input
            type="range"
            class="range"
            bind:this={slider}
            bind:value={defaultVal}
            disabled
            {min}
            {max}
            {step}
        />
    </div>
    <input
        type="number"
        class="value"
        bind:value={defaultVal}
        disabled
        {min}
        {max}
        {step}
    />
{/if}

<style>
    label {
        font-style: italic;
    }
    input.range {
        margin-left: 2px;
        margin-right: 2px;
        position: relative;
        transform: translateY(2px);
    }
    input.value {
        font-size: 0.8em;
        width: 50px;
    }

    input:disabled {
        color: #ff8cee;
        border: 1px solid #ff8cee;
        border-radius: 4px;
    }
    input:disabled::-moz-range-track {
        color: #ff8cee;
        border: 1px solid #ff8cee;
        border-radius: 4px;
        box-shadow: 1px 1px 2px #A6A6A6;
    }
</style>
