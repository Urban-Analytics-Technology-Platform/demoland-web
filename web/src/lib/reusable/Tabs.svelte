<script lang="ts">
    type Tab = {
        name: string;
        component: any;
    };
    export let tabs: Tab[] = [];
    export let activeTab: number = 0;

    function setActiveTab(index: number) {
        activeTab = index;
    }
</script>

<div class="tabs">
    {#each tabs as tab, index}
        <button
            class="tab"
            class:active={activeTab === index}
            on:click={() => setActiveTab(index)}
        >
            {tab.name}
        </button>
    {/each}

    {#each tabs as tab, index}
        {#if activeTab === index}
            <div class="tab-content">
                <svelte:component this={tab.component} />
            </div>
        {/if}
    {/each}
</div>
