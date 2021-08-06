<script>
    import { onError } from "svelte";

    export var error = false;

    onError(e => {
        error = true;
    });

    function action() {
        a.b;
    }
</script>

<div use:action />