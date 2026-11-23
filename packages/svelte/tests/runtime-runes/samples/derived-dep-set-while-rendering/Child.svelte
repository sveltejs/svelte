<script>
    import { store } from "./store.svelte.js";

    // This write marks the derived in main.svelte before it has reactions added to it.
    // This test checks that this does not cause the WAS_MARKED logic to incorrectly skip marking the derived subsequently.
    store.set("child-init-write", Math.random());
</script>
