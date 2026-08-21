<script lang="ts">
    import { hydratable } from 'svelte';

    hydratable('key', () => new Promise(() => { throw new Error('nope') }));
</script>