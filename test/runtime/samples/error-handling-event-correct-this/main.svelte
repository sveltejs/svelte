<script>
    import { onError } from "svelte";

    var a = {};
    var that;
    export var error = false;

    onError(e => {
        error = true;
    });

    function clickEvent() {
        that = this;
        console.log(a.b.c);
    }
</script>

<button on:click={clickEvent}></button>