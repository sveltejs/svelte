<script>
    import { onError } from "svelte";

    var a = {};
    export var error = false;

    onError(e => {
        error = true;
    });

    function clickEvent() {
        console.log(a.b.c);
    }
</script>

<button on:click={clickEvent}></button>