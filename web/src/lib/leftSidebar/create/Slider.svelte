<script lang="ts">
    export let modified: boolean;
    export let value: number | null;
    export let title: string;
    export let defaultVal: number; // Number shown when slider is activated
    export let leftEdge: number; // The number that the left edge of the div represents.
    export let rightEdge: number; // The number that the right edge of the div represents.
    export let min: number; // Minimum valid value for slider
    export let max: number; // Maximum valid value for slider
    export let step: number;

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    function setContainerPadding(node: HTMLElement) {
        node.style.paddingLeft = `${
            ((min - leftEdge) / (rightEdge - leftEdge)) * 100
        }px`;
        node.style.paddingRight = `${
            ((rightEdge - max) / (rightEdge - leftEdge)) * 100
        }px`;
        node.style.width = "104px";
    }
    function setSliderWidth(node: HTMLElement) {
        // node.style.width = `100px`;
        node.style.width = `${((max - min) / (rightEdge - leftEdge)) * 100}px`;
    }

    const idTitle = title.replace(/\s/g, "-").toLowerCase();

    function dispatchModified() {
        dispatch("modified", {});
    }
</script>

<label for="{idTitle}-modified">{title}</label>
<input
    type="checkbox"
    id="{idTitle}-modified"
    bind:checked={modified}
    on:change={() => {
        if (modified) {
            // ^ this is the state before the change, so this branch
            // corresponds to unchecking it
            value = defaultVal;
        }
        dispatchModified();
    }}
/>
{#if modified}
    <div use:setContainerPadding>
        <input
            type="range"
            class="range"
            use:setSliderWidth
            bind:value
            on:change={dispatchModified}
            {min}
            {max}
            {step}
        />
    </div>
    <input
        type="number"
        class="value"
        bind:value
        on:input={() => {
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
            dispatchModified();
        }}
        {min}
        {max}
        {step}
    />
{:else}
    <div use:setContainerPadding>
        <input
            type="range"
            class="range"
            use:setSliderWidth
            value={defaultVal}
            disabled
            {min}
            {max}
            {step}
        />
    </div>
    <input type="number" class="value" value="" disabled />
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
</style>
