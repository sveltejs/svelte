<script lang="ts">
    import { hydratable } from 'svelte';

    hydratable('key', () => Promise.resolve({
        nested: Promise.resolve({
            one: Promise.resolve(1),
        }),
        two: Promise.resolve(2),
    }));
    hydratable('key', () => Promise.resolve({
        nested: Promise.resolve({
            one: Promise.resolve(2),
        }),
        two: Promise.resolve(2),
    }));
</script>