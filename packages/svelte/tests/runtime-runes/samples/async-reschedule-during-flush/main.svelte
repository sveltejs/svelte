<script>
	import Child from './Child.svelte';

	let a = $state(false);
	let b = $state(false);

	let deferred = [];

	function push(value) {
		const d = Promise.withResolvers();
		deferred.push(() => d.resolve(value))
		return d.promise;
	}
</script>

<button onclick={() => a = !a}>a ({a})</button>
<button onclick={() => b = !b}>b ({b})</button>
<button onclick={() => deferred.shift()()}>resolve</button>

{#if a}
	{await push(42)}
	<Child />
{/if}
