<script lang="ts">
	import { hydratable } from "svelte";

	const { environment } = $props();

	const unresolved_hydratable = hydratable(
		"unused_key",
		() => new Promise(
			(res, rej) => environment === 'server' ? setTimeout(() => res('did you ever hear the tragedy of darth plagueis the wise?'), 0) : rej('should not run')
		)
	);
</script>

<svelte:boundary>
	<div>{await unresolved_hydratable}</div>
	{#snippet pending()}
		<div>Loading...</div>
	{/snippet}
</svelte:boundary>
