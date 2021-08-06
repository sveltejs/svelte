<script>
    import { onError } from "svelte";

    export var error = false;

    onError(e => {
        error = true;
    });

    function action(node, arg) {
        a.b;
    }
</script>

<div use:action={10} />