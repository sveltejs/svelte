<script>
    import { onError } from "svelte";

    var a = [1, 2, 3];
    export var error = false;
    
    onError(e => {
        error = true;
    });

    function handleClick() {
        a = 10;
    }
</script>

{#each a as item}
    {item}
{/each}

<button on:click={handleClick}></button>