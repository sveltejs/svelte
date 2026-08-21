<script lang="ts">
	import { hydratable } from "svelte";

	let { environment }: { environment: 'server' | 'browser' } = $props();

	let value;
	if (environment === 'server') {
		value = 'server';
	} else {
		value = hydratable('environment', () => environment);
	}
</script>

<p>The current environment is: {value}</p>
