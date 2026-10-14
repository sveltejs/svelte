<script>
	import Child from './Child.svelte';
	let x = $state(1);
	let s = $state(0);

	const resolvers = [];
	function slow(v) {
		return new Promise((r) => resolvers.push(() => r(v)));
	}
	function log(v) {
		console.log(v);
	}
</script>

<button onclick={() => x++}>x</button>
<button onclick={() => s++}>s</button>
<button onclick={() => resolvers.shift()?.()}>resolve</button>
<button onclick={() => resolvers.pop()?.()}>resolve last</button>

<svelte:boundary>
	{#snippet pending()}loading{/snippet}
	<Child {x} {s} {slow} {log} />
</svelte:boundary>
