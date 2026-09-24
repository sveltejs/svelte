<script>
	import Child from './Child.svelte';

	let show = $state(true);
</script>

<button onclick={() => (show = !show)}>toggle</button>

{#if show}
	<Child gate={await Promise.resolve(true)} />
{/if}
