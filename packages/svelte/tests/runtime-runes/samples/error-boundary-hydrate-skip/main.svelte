<script>
	import Child from './child.svelte';

	let { show } = $props();
</script>

{#if show}
	<svelte:boundary>
		<Child />

		{#snippet failed()}
			<p>failed</p>
		{/snippet}
	</svelte:boundary>

	<p>after</p>
{:else}
	<p>else</p>
{/if}

<p>end</p>
