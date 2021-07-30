<script>
    import { onError } from "svelte";

    var a = {};
    export var error = false;

    onError(e => {
        error = true;
    });
</script>

{a.b.c}