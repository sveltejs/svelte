<script lang="ts">
	import { writable } from 'svelte/store';

	let store = $derived(await Promise.resolve(writable(42)));
	// reads `store` via the subscription
	let value = $derived(await Promise.resolve($store));
</script>

<p>{value}</p>
