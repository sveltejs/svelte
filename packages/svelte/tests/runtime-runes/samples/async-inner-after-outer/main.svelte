<script>
	let show = $state(true);
	let count = $state(0);
	let queue = [];

	function foo() {
		const {promise, resolve} = Promise.withResolvers();
		const s = show;
		queue.push(() => resolve(s));
		return promise;
	}

	function bar() {
		const {promise, resolve} = Promise.withResolvers();
		const s = show;
		queue.push(() => {
			// This will create a new batch while the other batch is still in flight
			count++
			resolve(s);
		});
		return promise;
	}

	$effect(() => { count; });
</script>

<svelte:boundary>
	{#if await foo()}
		<p>{await bar()}</p>
	{/if}

	<button onclick={() => {
		show = !show
	}}>toggle</button>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>

<button onclick={() => queue.shift()()}>shift</button>