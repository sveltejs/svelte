<script>
	import { hydratable } from "svelte";

	const { key } = $props();

	const value = await hydratable(key, () => Promise.resolve('safe'));
</script>

<p>{value}</p>
