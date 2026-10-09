<script lang="ts">
    import { hydratable } from 'svelte';

    hydratable('key', () => Promise.resolve(() => {}));
</script>
