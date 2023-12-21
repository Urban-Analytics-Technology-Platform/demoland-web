<script lang="ts">
    export let title: string;
</script>

<h3>{title}</h3>

<div class="input-fields-container">
    <slot />
</div>

<style>
    div.input-fields-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    h3 {
        font-size: 100%;
        font-weight: bold;
    }
</style>
