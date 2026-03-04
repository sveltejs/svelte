<script lang="ts">
    import { hydratable } from 'svelte';

    await hydratable('key', () => 'first');
    await hydratable('key', () => 'first');
</script>