<script>
    import Child from "./child.svelte";
    import { onError } from "svelte";

    export var error = false;

    onError(e => {
        error = true;
    });
</script>

<svelte:component this={Child} />