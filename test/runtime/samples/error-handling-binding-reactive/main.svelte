<script>
    import { onError } from "svelte";

    var a = {
        b: {
            c: "10"
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

<input bind:value={a.b.c} />
<button on:click={clickEvent}></button>