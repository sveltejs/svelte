<script lang="ts">
	import { hydratable } from "svelte";

	let { environment }: { environment: 'server' | 'browser' } = $props();

	const value = hydratable("environment", () => environment, {
		transport: environment === 'server' ? {
			encode: (val: string) => JSON.stringify([val])
		} : {
			decode: (val: [string]) => val[0]
		}
	})
</script>

<p>The current environment is: {value}</p>
