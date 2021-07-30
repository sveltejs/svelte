<script>
    import { onError } from "svelte";

    var a = {
        b: {
            c: 10
        }
    };
    export var error = false;

    onError(e => {
        error = true;
    });

    function causeError() {
        a = {};
    }
</script>

{a.b.c}

<button on:click={causeError}></button>