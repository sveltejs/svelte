<script>
	import { hydratable } from 'svelte';

	let { environment } = $props();

	// the string '1' serializes as `"1"`, which must not be confused
	// with the placeholder used for the first promise
	const data = hydratable('data', () => ({ label: '1', value: Promise.resolve(environment) }));

	const value = await data.value;
</script>

<p>{data.label} {value}</p>
