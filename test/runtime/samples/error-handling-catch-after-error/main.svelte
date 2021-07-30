<script>
    import { onError } from "svelte";

    var a = {};
    export var error = false;

    a.b.c

    onError(e => {
        error = true;
    });
</script>