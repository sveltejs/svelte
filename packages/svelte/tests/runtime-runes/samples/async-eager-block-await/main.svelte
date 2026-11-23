<script>
	let trigger = $state(false);
	let indirect = $state(false);
	let direct = $state(false);

	const resolvers = [];

	$effect(() => {
		indirect ||= trigger;
	});

	function delay(value, ms = 1000) {
		return new Promise((f) => {
			resolvers.push(() => f(value));
		});
	}
</script>

<button onclick={() => (trigger = true)}>indirect</button>
<button onclick={() => (direct = true)}>direct</button>
<button onclick={() => resolvers.shift()?.()}>resolve</button>

<div id="output">
	{#if indirect}
		<p>indirect</p>
		<p>{await delay('hello')}</p>
	{/if}

	{#if direct}
		<p>direct</p>
		<p>{await delay('hello')}</p>
	{/if}
</div>
