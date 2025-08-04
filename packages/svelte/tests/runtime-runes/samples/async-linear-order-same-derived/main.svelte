<script>
	let delay = 1000;
	let a = $state(1);
	let b = $state(2);

	let d1 = Promise.withResolvers();
	let d2 = Promise.withResolvers();
	let deferred = d1;

	async function add(a, b) {
		await deferred.promise;
		return a + b;
	}
</script>

<button onclick={() => a++}>a++</button>
<button onclick={() => b++}>b++</button>

<button onclick={() => deferred = d1 = Promise.withResolvers()}>reset 1</button>
<button onclick={() => deferred = d2 = Promise.withResolvers()}>reset 2</button>

<button onclick={() => d1.resolve()}>resolve 1</button>
<button onclick={() => d2.resolve()}>resolve 2</button>

<svelte:boundary>
	<p id="test">{a} + {b} = {await add(a, b)}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
