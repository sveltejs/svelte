<script>
	let show = $state(true);
	let other = $state(0);
	let c = $state(1);
	const queued = [];

	function delay(value) {
		console.log(`delay ${value}`);
		return new Promise((resolve) => queued.push({ value, resolve: () => resolve(value) }));
	}

	function resolve(value) {
		for (const r of queued.filter((r) => r.value === value)) {
			queued.splice(queued.indexOf(r), 1);
			r.resolve();
		}
	}

	// nothing (including the buttons) shows up until the initial render resolves
	queueMicrotask(() => {
		for (const r of queued.splice(0)) r.resolve();
	});
</script>

<button
	onclick={() => {
		show = false;
		other = 3;
	}}>hide</button
>
<button
	onclick={() => {
		show = true;
		other = 5;
	}}>show</button
>
<button onclick={() => (c = 2)}>c = 2</button>
<button onclick={() => resolve(3)}>resolve 3</button>
<button onclick={() => resolve(5)}>resolve 5</button>
<button onclick={() => resolve(2)}>resolve 2</button>

<p>{await delay(other)}</p>
{#if show}<i>{await delay(c)}</i>{/if}
