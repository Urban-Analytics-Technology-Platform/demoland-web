<script lang="ts">
    export let selectedTab: "choose" | "create" | "import";
</script>

<div class="tabs">
    <input
        type="radio"
        class="tab-input"
        id="choose"
        bind:group={selectedTab}
        value="choose"
        checked
    />
    <label for="choose" class="tab-label">View scenarios</label>

    <input
        type="radio"
        class="tab-input"
        id="create"
        bind:group={selectedTab}
        value="create"
    />
    <label for="create" class="tab-label">Create your own</label>

    <input
        type="radio"
        class="tab-input"
        id="import"
        bind:group={selectedTab}
        value="import"
    />
    <label for="import" class="tab-label">Import from file</label>
</div>

<style>
    div.tabs {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(3, 1fr);
    }

    input.tab-input {
        display: none;
    }

    label.tab-label {
        display: block;
        padding: 5px 10px;
        border: 1px solid #e6e6e6;
        border-bottom: none;
        border-radius: 6px 6px 0px 0px;
        background-color: #f0f0f0;
        color: #333333;
        cursor: pointer;
        font-family: inherit;
        text-align: center;
        font-size: 90%;
    }

    input.tab-input:checked + label.tab-label {
        background-color: #ffffff;
        color: #000000;
        font-weight: bold;
    }
</style>
