<script lang="ts">
    export let labelText: string;
    export let hoverText: string;
    export let forInputName: string;
</script>

<label for="{forInputName}" title={hoverText} class="hover-description">{labelText}</label>

<style>
    label.hover-description {
        font-style: italic;
        text-decoration: underline dotted 1.5px;
        cursor: help;
    }
</style>
