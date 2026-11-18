<script>
	import { getAbortSignal } from 'svelte';
</script>

<svelte:boundary>
	<p>{await Promise.resolve(true) && getAbortSignal()}</p>

	{#snippet failed(error)}
		<p>{error.message.split('\n')[0]}</p>
	{/snippet}
</svelte:boundary>
