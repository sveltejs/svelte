<script>
	import { fork } from 'svelte';

	let show = $state(false);
	let count = $state(0);
	let items = $state([0]);
	let a;
	let b;
</script>

<button onclick={() => (a = fork(() => { show = true; count = 1; items = [1, 2]; }))}>fork a</button>
<button onclick={() => (b = fork(() => (show = true)))}>fork b</button>
<button onclick={() => (show = true)}>reveal</button>
<button onclick={() => a.commit()}>commit a</button>
<button onclick={() => b.commit()}>commit b</button>
<button onclick={() => { a?.discard(); b?.discard(); show = false; count = 0; items = [0]; }}>reset</button>

{#if show}
	<svelte:boundary><b>static</b></svelte:boundary>
	<p>{count}</p>
	{#each items as item (item)}<span>{item}</span>{/each}
{/if}
