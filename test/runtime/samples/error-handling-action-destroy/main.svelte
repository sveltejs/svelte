<script>
    import { onError } from "svelte";

    export var visible = true;
    export var error = false;

    onError(e => {
        error = true;
    });

    function action(node, arg) {
        return {
            destroy() {
                a.b;
            }
        }
    }
</script>

{#if visible}
    <div use:action />
{/if}