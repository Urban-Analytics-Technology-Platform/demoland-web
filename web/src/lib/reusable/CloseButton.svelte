<script lang="ts">
    import closeButtonUrl from "src/assets/close-button.svg";
</script>

<button id="close-button" on:click>
    <img src={closeButtonUrl} alt="Close" />
</button>

<style>
    button#close-button {
        border: none;
        cursor: pointer;
        background-color: #ffffff;
        padding: 0;
        margin: 0;
        width: var(--width);
        height: var(--width);
        transform: translate3d(0, 0, 0);
    }
    button#close-button > img {
        width: 100%;
        height: 100%;
        transform: translate3d(0, 0, 0);
    }
    button#close-button:hover {
        background-color: #dddddd;
    }
</style>
