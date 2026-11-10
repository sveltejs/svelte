<script>
	import Child from './Child.svelte';

	let count = $state(0);
</script>

<button onclick={() => count++}>increment</button>

<svelte:boundary>
	<Child {count} />

	{#snippet failed()}
		<p>failed</p>
	{/snippet}
</svelte:boundary>
