<script>
    import { onError } from "svelte";

    var error = false;

    onError(e => {
        error = true;
    });
</script>