<script lang="ts">
	import { hydratable } from "svelte";

	const { environment } = $props();

	const partially_used_hydratable = hydratable(
		"partially_used",
		() => {
			return {
				used: new Promise(
					(res, rej) => environment === 'server' ? setTimeout(() => res('did you ever hear the tragedy of darth plagueis the wise?'), 0) : rej('should not run')
				),
				unused: new Promise(
					(res, rej) => environment === 'server' ? setTimeout(() => res('no, sith daddy, please tell me'), 0) : rej('should not run')
				),
			}
		}
	);
</script>

<div>{await partially_used_hydratable.used}</div>
<svelte:boundary>
	<div>{await partially_used_hydratable.unused}</div>
	{#snippet pending()}
		<div>Loading...</div>
	{/snippet}
</svelte:boundary>
