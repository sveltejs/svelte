<script>
    import { onError } from "svelte";

    var a = {}
    export var error = false;
    
    onError(e => {
        error = true;
    });
</script>

{#each a.b.c as item}
    {item}
{/each}