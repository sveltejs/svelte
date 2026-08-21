<script>
	let deferreds = [];

	let a = $state(1);
	let b = $state(2);

	async function push(a, b) {
		var d = Promise.withResolvers();
		deferreds.push(d);
		await d.promise;

		return a + b;
	}
</script>

<button onclick={() => a++}>a++</button>
<button onclick={() => b++}>b++</button>

<button onclick={() => deferreds.shift()?.resolve()}>shift</button>
<button onclick={() => deferreds.pop()?.resolve()}>pop</button>

<svelte:boundary>
	<p id="test">{a} + {b} = {await push(a, b)}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
