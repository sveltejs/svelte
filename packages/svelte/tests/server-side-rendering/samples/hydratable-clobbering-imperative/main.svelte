<script lang="ts">
    import { hydratable } from 'svelte';

    hydratable.set('key', 'first');
    hydratable.set('key', 'second');
</script>