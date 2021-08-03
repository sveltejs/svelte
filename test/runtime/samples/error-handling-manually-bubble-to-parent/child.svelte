<script>
    import { onError } from "svelte";

    onError(e => {
        throw e;
    });

    var a = {};
    console.log(a.b.c);
</script>