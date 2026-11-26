<script>
	import Child from './Child.svelte';

	let show = $state(false);

	const queue = [];

	function push(v) {
		const d = Promise.withResolvers();
		queue.push(() => d.resolve(v));
		return d.promise;
	}
</script>

<button onclick={() => (show = true)}>show</button>
<button onclick={() => queue.shift()?.()}>shift</button>

<svelte:boundary>
	<Child {show} {push} />

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
