<script>
	import { fork } from 'svelte';

	let a = $state(0);
	let b = $state(0);
	let show = $state(false);
	let list = $state([0, 1]);

	let fork_a;
	let fork_b;

	const queued = [];
	let initial = true;

	// values are available right away during the initial render, after that only once resolved
	function delay(value) {
		if (initial) return value;
		return new Promise((resolve) => queued.push(() => resolve(value)));
	}

	$effect(() => {
		initial = false;
	});
</script>

<button onclick={() => (fork_a = fork(() => (show = true)))}>fork a</button>
<button onclick={() => (fork_b = fork(() => { b = 2; a = 1; }))}>fork b</button>
<button onclick={() => (list = [0, 1])}>list = [0, 1]</button>
<button onclick={() => { b = 2; show = true; }}>b = 2, show = true</button>
<button onclick={() => fork_a.commit()}>commit a</button>
<button onclick={() => fork_b.commit()}>commit b</button>
<button onclick={() => { for (const resolve of queued.splice(0)) resolve(); }}>resolve all</button>

<svelte:boundary>
	<p>{await delay(`p${a}`)}</p>

	{#if show}
		<section>{await delay(`s${b}`)}</section>
	{/if}

	{#each list as x}
		<s>{x}</s>
	{/each}

	{#await delay(`aw${b}`) then v}<q>{v}</q>{/await}
</svelte:boundary>
