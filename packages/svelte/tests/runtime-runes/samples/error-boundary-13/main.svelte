<script>
	import Child from './Child.svelte';

	let count = $state(0);
</script>

<button onclick={() => count++}>change</button>

<svelte:boundary>
	<Child {count} />

	{#snippet failed()}
		<p>Error occurred</p>
	{/snippet}
</svelte:boundary>
