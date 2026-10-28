<script>
	import Child from './Child.svelte';

	let show = $state(true);
	let count = $state(0);

	function fade() {
		return { duration: 100, tick: () => {} };
	}
</script>

<button onclick={() => (show = false)}>hide</button>
<button onclick={() => count++}>increment</button>

{#if show}
	<div transition:fade><Child {count} /></div>
{/if}
