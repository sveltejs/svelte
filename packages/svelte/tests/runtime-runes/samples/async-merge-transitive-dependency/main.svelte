<script>
	import Child from './Child.svelte';
	let a = $state(0);
	let b = $state(0);
	let c = $state(0);

	const resolvers = [];
	function slow(v) {
		return new Promise((r) => resolvers.push(() => r(v)));
	}
	function fast(v) {
		return Promise.resolve(v);
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<button onclick={() => c++}>c</button>
<button onclick={() => resolvers.shift()?.()}>resolve</button>
<button onclick={() => resolvers.pop()?.()}>resolve last</button>

<svelte:boundary>
	{#snippet pending()}loading{/snippet}
	<Child {a} {b} {c} {slow} {fast} />
</svelte:boundary>
