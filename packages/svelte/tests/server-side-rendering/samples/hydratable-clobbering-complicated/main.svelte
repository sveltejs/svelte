<script lang="ts">
    import { hydratable } from 'svelte';

    const a = await hydratable('key', () => Promise.resolve({
        nested: Promise.resolve({
            one: Promise.resolve(1),
        }),
        two: Promise.resolve(2),
    }));
    const b = await hydratable('key', () => Promise.resolve({
        nested: Promise.resolve({
            one: Promise.resolve(2),
        }),
        two: Promise.resolve(2),
    }));
</script>

<p>{await (await (a.nested)).one}</p>
<p>{await a.two}</p>
<p>{await (await (b.nested)).one}</p>
<p>{await b.two}</p>
