<script>
    import { onError } from "svelte";

    var a = {};
    export var error = false;

    onError(e => {
        error = true;
    });
</script>

<a href={a.b.c}></a>