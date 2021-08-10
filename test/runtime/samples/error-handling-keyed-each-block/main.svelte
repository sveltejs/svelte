<script>
    import { onError } from "svelte";

    var a = [{}]
    export var error = false;
    
    onError(e => {
        error = true;
    });
</script>

{#each a as item (item.a.b)}
    {item}
{/each}