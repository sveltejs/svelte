<script>
	import { hydratable } from "svelte";
    const foo = await hydratable('key', () => Promise.resolve('bar'));
</script>