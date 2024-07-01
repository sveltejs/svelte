<script>
	import Child from './Child.svelte';

	let open = $state(false);
</script>

<button onclick={() => (open = !open)}>toggle</button>

{#if open}
	<Child />
{/if}
