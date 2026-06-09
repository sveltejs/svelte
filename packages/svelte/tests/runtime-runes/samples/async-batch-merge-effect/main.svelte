<script>
	let x = $state(0);
	let y = $state(0);

	const queued = [];

	function push(v) {
		if (v === 0) return v;

		return new Promise((fulfil) => {
			queued.push(() => fulfil(v));
		});
	}
</script>

<button onclick={() => x++}>x</button>
<button onclick={() => {x++;y++}}>x/y</button>
<button onclick={() => (queued.pop()?.())}>pop</button>

{await push(x)} {await push(y)}

{#if true}
	{y}
{/if}

