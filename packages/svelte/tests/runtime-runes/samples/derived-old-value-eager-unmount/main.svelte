<script>
	import Child from './Child.svelte';

	let source = $state(1);
	let count = $state(1);

	// State is updated indirectly via an effect — triggers the eager block effects path
	$effect(() => {
		count = source;
	});
</script>

<button onclick={() => (source = 5)}>unmount</button>

{#if count < 5}
	<Child {count} />
{/if}
