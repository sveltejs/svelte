<script>
    import { onError } from "svelte";

    var a = {};
    export var error = false;

    onError(e => {
        error = true;
    });
</script>

{#if a.b.c === true}
    Hello world
{/if}