<script lang="ts">
	import { hydratable } from "svelte";

	let { environment } = $props();

	const value = hydratable("environment", () => environment)
</script>

<p>The current environment is: {value}</p>
