<script>
	let show = $state(true);
	let b = $state(0);
	let c = $state(0);
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
		b = 1;
		show = false;
	}}>b = 1, show = false</button
>
<button
	onclick={() => {
		c = 1;
		show = true;
	}}>c = 1, show = true</button
>
<button onclick={() => resolve('p1')}>resolve p1</button>
<button onclick={resolve_all}>resolve all</button>

<p>{await delay('p' + b)}</p>
<u>{await delay('c' + c)}</u>
{#if show}<i>{await delay('i' + b)}</i>{/if}
