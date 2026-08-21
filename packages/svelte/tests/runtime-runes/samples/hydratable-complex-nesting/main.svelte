<script lang="ts">
	import { hydratable } from "svelte";

	let { environment } = $props();

	const value = hydratable("environment", () => Promise.resolve({
		nested: Promise.resolve({
			environment
		})
	}))
</script>

<p>The current environment is: {await value.then(res => res.nested).then(res => res.environment)}</p>
