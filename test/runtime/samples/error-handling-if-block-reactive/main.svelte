<script>
    import { onError } from "svelte";

    var a = {
        b: {
            c: false
        }
    };
    export var error = false;

    onError(e => {
        error = true;
    });

    function clickEvent() {
        a = {};
    }
</script>

<button on:click={clickEvent}></button>

{#if a.b.c === true}
    Hello world
{/if}