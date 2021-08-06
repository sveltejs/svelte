<script>
    import { onError } from "svelte";

    var a = {};
    export var error = false;

    onError(e => {
        error = true;
    });
</script>

<button on:click={() => console.log(a.b.c)}></button>