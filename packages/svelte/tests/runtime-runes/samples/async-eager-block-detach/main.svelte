<script>
	let trigger = $state(false);
	let show = $state(false);

	const resolvers = [];

	$effect(() => {
		show = trigger;
	});

	function delay(value) {
		return new Promise((f) => resolvers.push(() => f(value)));
	}
</script>

<button onclick={() => (trigger = true)}>show</button>
<button onclick={() => resolvers.shift()?.()}>resolve</button>

{#if show}
	<p>true</p>
	<p>{await delay('shown')}</p>
{:else}
	<p>false</p>
{/if}
