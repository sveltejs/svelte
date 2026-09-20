<script>
	import Child from './Child.svelte';
	let a = $state(0);
	let b = $state(0);
	let c = $state(0);
	let calls = [];

	const resolvers = [];
	function slow(v) {
		return new Promise((r) => resolvers.push(() => r(v)));
	}

	export function get_calls() {
		return calls;
	}

	function track(...args) {
		calls.push(args.join('/'));
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
