<script>
	import Child from "./Child.svelte";

	function throw_error() {
		throw new Error('test')
	}
</script>

<svelte:boundary onerror={(e) => console.log('error caught 2')}>
	<svelte:boundary onerror={(e) => console.log('error caught 1')}>
		<Child />

		{#snippet failed()}
			{throw_error()}
		{/snippet}
	</svelte:boundary>
</svelte:boundary>


