<script>
	import Child from './Child.svelte';

	let show = $state(false);
</script>

<button onclick={() => (show = true)}>Mount the child</button>
{#if show}<Child />{/if}
