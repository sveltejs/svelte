<script>
	import Inner from './Inner.svelte';

	let counter = 0;
	let show = true;

	const toggle = () => (show = !show);
	const handleTick = () => (counter += 1);
</script>

<div>
	<button on:click={toggle}>{show ? 'Destroy' : 'Show'} Inner component</button>
	<p>counter={counter}</p>
	{#if show}
		<Inner callback={handleTick} />
	{/if}
</div>
