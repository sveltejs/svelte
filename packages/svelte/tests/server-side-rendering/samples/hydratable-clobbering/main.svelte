<script lang="ts">
    import { hydratable } from 'svelte';

    hydratable('key', () => 'first');
    hydratable('key', () => 'second');
</script>