<script>
    import Child from "./child.svelte";
    import { onError } from "svelte";

    var show = false;
    export var error = false;

    onError(e => {
        error = true;
    });

    function clickEvent() {
        show = true;
    }
</script>

<button on:click={clickEvent}></button>

{#if show}
    <Child />
{/if}