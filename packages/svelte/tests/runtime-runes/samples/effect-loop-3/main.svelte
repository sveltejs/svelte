<script>
	import Child from './Child.svelte';

	let show = $state(false);
</script>

<button onclick={() => show = !show}>
	toggle
</button>

{#if show}
	{#each { length: 1234 } as i}
		<Child>{i}</Child>
	{/each}
{/if}
