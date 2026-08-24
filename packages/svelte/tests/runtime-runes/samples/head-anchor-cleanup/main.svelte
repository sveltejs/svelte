<script>
	import Child from './Child.svelte';

	let visible = $state(false);
</script>

<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	<Child />
{/if}
