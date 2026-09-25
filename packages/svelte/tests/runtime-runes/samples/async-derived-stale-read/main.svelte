<script>
	let a = $state(0);
	let b = $state(0);

	let d = $derived(a + b);

	let queued = [];
	function push(v) {
		if (!v) return v;
		return new Promise((resolve) => {
			queued.push(() => resolve(v));
		});
	}

	$effect(() => console.log(d));
</script>

<button onclick={() => a++}>a++</button>
<button onclick={() => b++}>b++</button>
<button onclick={() => console.log(d)}>log d</button>
<button onclick={() => queued.shift()?.()}>resolve</button>

{#if await push(a + b)}
	{#if d === 1}
		<p>d is {d}</p>
	{/if}
{/if}
