<script>
	import { tick } from 'svelte';
	
	let selected = $state(-1);
	let current = $state();

	let div; // explicitly no $state
</script>

{#each [1, 2, 3] as n, i}
	<button
		onclick={async () => {
			selected = i;
			await tick();
			current = div?.textContent;
		}}
	>{n}</button>
{/each}

<hr />

{#each [1, 2, 3] as n, i}
	{#if selected === i}
		<div bind:this={div}>{n}</div>
	{/if}
{/each}

<hr />

<p>{current ?? '...'}</p>