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

    function setSliderPosition() {
        const sliderWidth = ((max - min) / (rightEdge - leftEdge)) * 100;
        slider.style.width = `${sliderWidth}px`;
        const marginLeft = ((min - leftEdge) / (rightEdge - leftEdge)) * 100;
        const marginRight = ((rightEdge - max) / (rightEdge - leftEdge)) * 100;
        slider.style.marginLeft = `${marginLeft}px`;
        slider.style.marginRight = `${marginRight}px`;
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
        // Update the slider width and margin when any of the parameters change
        // (in effect, when the underlying signature type changes)
        min, max, leftEdge, rightEdge, defaultVal;
        if (container && slider) {
            setSliderPosition();
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
    <div bind:this={container} class="container">
        <div class="slider-background red" />
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
    <div bind:this={container} class="container">
        <div class="slider-background grey" />
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

    div.container {
        position: relative; /* required for red-background to be positioned correctly */
        width: 100px;
        margin-left: 2px;
        margin-right: 2px;
    }

    div.slider-background {
        position: absolute;
        height: 5px;
        /* I don't know why -3px instead of -2.5, but it works */
        top: calc(50% - 3px);
        width: 100%;
        left: 0;
        border-radius: 4px;
        cursor: not-allowed;
    }
    div.slider-background.red {
        background-color: #f0d8de;
    }
    div.slider-background.grey {
        background-color: #e2e2e2;
    }

    input[type="checkbox"] {
        cursor: pointer;
    }

    input[type="number"]:disabled {
        color: #aaa;
        cursor: not-allowed;
    }

    /* cross-browser slider CSS. :upside_down_smile: */
    input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        background: transparent;
        z-index: 2;
        --disabled-color: #d0d0d0;
        --active-color: #0d8c08;
        --thumb-color: #ddd;

        &:focus {
            outline: none;
        }
        &::-webkit-slider-runnable-track {
            -webkit-appearance: none;
            appearance: none;
            /* For webkit browsers, need to move it upwards by the height. Not sure why. */
            position: relative;
            /* This value is off by a little bit in Safari (needs top: -4.5px). I don't know why.
               However, there isn't a robust way to detect Safari (and not Chrome), so I'm
               going to ignore it. */
            top: -5px;
            height: 5px;
            cursor: pointer;
            background: var(--active-color);
            border-radius: 2px;
        }
        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            border: 1px solid #444;
            height: 15px;
            width: 15px;
            border-radius: 25px;
            background: var(--thumb-color);
            cursor: pointer;
            margin-top: -5px;
        }
        &::-moz-range-track {
            height: 5px;
            cursor: pointer;
            background: var(--active-color);
            border-radius: 2px;
        }
        &::-moz-range-thumb {
            border: 1px solid #444;
            height: 15px;
            width: 15px;
            border-radius: 25px;
            background: var(--thumb-color);
            cursor: pointer;
        }
        /* Grey out disabled sliders */
        &:disabled::-webkit-slider-runnable-track {
            background: var(--disabled-color);
            cursor: not-allowed;
        }
        &:disabled::-webkit-slider-thumb {
            cursor: not-allowed;
        }
        &:disabled::-moz-range-track {
            background: var(--disabled-color);
            cursor: not-allowed;
        }
        &:disabled::-moz-range-thumb {
            cursor: not-allowed;
        }
    }
</style>
