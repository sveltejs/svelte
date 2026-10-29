<script>
	let b = $state(0);
	let show = $state(false);

	let deferreds = [];

	function push(key, v) {
		const d = Promise.withResolvers();
		deferreds.push({ key, v, d });
		return d.promise;
	}

	function resolve(key) {
		const entry = deferreds.find((d) => d.key === key);
		if (!entry) return;
		deferreds.splice(deferreds.indexOf(entry), 1);
		entry.d.resolve(entry.v);
	}

	// nothing (including the buttons) shows up until the initial render resolves
	queueMicrotask(() => {
		resolve('y');
		resolve('z');
	});
</script>

<button onclick={() => (show = true)}>show</button>
<button onclick={() => b++}>b</button>
<button
	onclick={() => {
		resolve('x');
		resolve('y');
	}}>resolve x, y</button
>
<button onclick={() => resolve('z')}>resolve z</button>

<span>{await push('y', b)}</span>
<i>{await push('z', b)}</i>

{#if show}
	<svelte:boundary>
		<p>{await push('x', 'x')} {b}</p>

		{#snippet pending()}
			<p>loading</p>
		{/snippet}
	</svelte:boundary>
{/if}
