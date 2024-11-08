<script>
	import Child from './Child.svelte';
</script>

<div>content before</div>

<svelte:boundary onerror={(e) => console.log('error caught 2')}>
	<svelte:boundary onerror={(e) => console.log('error caught 1')}>
		<Child />

		{#snippet failed(err, reset)}
			<div>An error occurred! {err}</div>
			<Child initial={2} />
		{/snippet}
	</svelte:boundary>
</svelte:boundary>

<div>content after</div>
