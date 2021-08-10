<script>
    import { onError } from "svelte";

    var a = [{
        a: {
            b: 10
        }
    }];

    export var error = false;
    
    onError(e => {
        error = true;
    });

    function clickEvent() {
        a = [{}];
    }
</script>

<button on:click={clickEvent}></button>

{#each a as item (item.a.b)}
    {item}
{/each}