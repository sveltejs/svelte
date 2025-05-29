<script>
	import Component from './Component.svelte';

	let count = $state(0);
</script>

<button onclick={() => count++}>{count}</button>

{#if count < 2}
	<Component
		data-count={count}
		{@attach () => {
			console.log('up');
			return () => console.log('down');
		}}
	/>
{/if}
