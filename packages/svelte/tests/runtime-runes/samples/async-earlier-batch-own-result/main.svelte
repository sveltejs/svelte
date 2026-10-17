<script>
	let flag = $state(true);
	let d = $state(1);
	let x = $state(10);
	const pending = [];

	function wait(v) {
		return new Promise((r) => pending.push({ v, r: () => r(v) }));
	}

	function resolve(v) {
		const i = pending.findIndex((p) => p.v === v);
		if (i !== -1) pending.splice(i, 1)[0].r();
	}
</script>

<button onclick={() => (flag = false)}>flag</button>
<button onclick={() => d++}>d</button>
<button onclick={() => resolve('d1')}>d1</button>
<button onclick={() => resolve('d2')}>d2</button>
<button onclick={() => resolve('x10')}>x10</button>

<svelte:boundary>
	<p>{await wait(flag ? 'd' + d : 'x' + x)}</p>
	<span>{flag} {d}</span>
	{#snippet pending()}<p>loading</p>{/snippet}
</svelte:boundary>
