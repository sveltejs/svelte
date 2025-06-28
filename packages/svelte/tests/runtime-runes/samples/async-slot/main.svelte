<script>
	import Child from './Child.svelte';
</script>

<svelte:boundary>
	<Child let:message>
		<p>{message}</p>
	</Child>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
