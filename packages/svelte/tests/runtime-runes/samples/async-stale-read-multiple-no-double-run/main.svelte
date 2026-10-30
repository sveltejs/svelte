<script>
	import Child from './Child.svelte';
	let a = $state(0);
	let b = $state(0);
	let c = $state(0);

	const resolvers = [];
	function slow(v) {
		return new Promise((r) => resolvers.push(() => r(v)));
	}

	function track(...args) {
		console.log(args.join('/'));
		return slow(args.join('/'));
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => { b++; c++; }}>bc</button>
<button onclick={() => resolvers.shift()?.()}>resolve</button>

<svelte:boundary>
	{#snippet pending()}loading{/snippet}
	<Child {a} {b} {c} {slow} {track} />
</svelte:boundary>
