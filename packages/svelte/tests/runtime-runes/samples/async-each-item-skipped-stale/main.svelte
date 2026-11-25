<script>
	let list = $state([0, 1]);
	let c = $state(1);
	const queued = [];

	function delay(value) {
		return new Promise((resolve) => queued.push({ value, resolve: () => resolve(value) }));
	}

	function resolve(value) {
		for (const r of queued.filter((r) => r.value === value)) {
			queued.splice(queued.indexOf(r), 1);
			r.resolve();
		}
	}

	function resolve_all() {
		for (const r of queued.splice(0)) r.resolve();
	}

	// nothing (including the buttons) shows up until the initial render resolves
	queueMicrotask(resolve_all);
</script>

<button
	onclick={() => {
		c = 2;
		list = [3];
	}}>c = 2, list = [3]</button
>
<button onclick={() => (list = [5, 1])}>list = [5, 1]</button>
<button onclick={() => resolve(6)}>resolve 6</button>
<button onclick={resolve_all}>resolve all</button>

{#each list as x}<s>{x}|{await delay(x * c)}</s>{/each}
