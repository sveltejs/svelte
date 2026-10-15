<script lang="ts">
	import { hydratable } from 'svelte';

	let { environment } = $props();
	const key = async (k: string) => k;
</script>

<p>{await hydratable(await key('a'), () => Promise.resolve(environment))} {await hydratable(await key('b'), () => Promise.resolve(environment))}</p>
