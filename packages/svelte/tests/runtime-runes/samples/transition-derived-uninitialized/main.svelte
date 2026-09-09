<script>
	import Child from './Child.svelte';
	let show = $state(false);
</script>

<button onclick={() => (show = true)}>fly in</button>
<button onclick={() => (show = false)}>fly out</button>

{#if show}
	<Child />
{/if}
