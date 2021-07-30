<script>
    import { onError } from "svelte";

    var a = {};
    export var error = false;

    onError(e => {
        error = true;
    });

    a.b.c
</script>