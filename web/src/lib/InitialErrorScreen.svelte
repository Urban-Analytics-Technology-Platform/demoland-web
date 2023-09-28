<script lang="ts">
    export let appErrorMessage: string;
</script>


<div id="background">
<div id="error">
    <h1>Oops: DemoLand failed to load!</h1>
    <p>{appErrorMessage}</p>
</div>
</div>


<style>
    div#background {
        position: fixed;
        top: 0;
        left: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
        background-color: rgba(239, 239, 239, 0.7);
    }

    div#error {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 30px 40px;
        width: max-content;
        max-width: 80vw;
        border-radius: 20px;
        background-color: #ffe8ea;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    }

    div#error > h1 {
        font-size: 2em;
        margin-top: 0;
        margin-bottom: 1rem;
    }
    
    div#error > p {
        margin-bottom: 0;
    }
</style>
