<script>
	import Child from './Child.svelte';

	const { environment } = $props();
</script>

<svelte:boundary>
	<Child {environment} />
	{await new Promise(() => {})}

	{#snippet pending()}loading inner{/snippet}
	{#snippet failed(error)}inner failed: {error.message}{/snippet}
</svelte:boundary>

<svelte:boundary>
	<svelte:boundary>
		<Child {environment} />
		{await new Promise(() => {})}

		{#snippet pending()}loading nested{/snippet}
	</svelte:boundary>

	{#snippet failed(error)}outer failed: {error.message}{/snippet}
</svelte:boundary>
