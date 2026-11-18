<script>
	let list = $state([0, 1]);
	let b = $state(0);
	const queued = [];

	function delay(value) {
		return new Promise((resolve) => queued.push(() => resolve(value)));
	}

	function resolve_all() {
		for (const r of queued.splice(0)) r();
	}

	// nothing (including the buttons) shows up until the initial render resolves
	queueMicrotask(resolve_all);
</script>

<button onclick={() => (b = 2)}>b = 2</button>
<button onclick={() => (list = [2, 1])}>list = [2, 1]</button>
<button onclick={() => (list = [2, 0, 3])}>list = [2, 0, 3]</button>
<button onclick={resolve_all}>resolve all</button>

{#each list as x (x)}<b>{await delay(x + b)}</b>{/each}
