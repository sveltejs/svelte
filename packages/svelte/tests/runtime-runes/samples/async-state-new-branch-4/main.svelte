<script>
	import Child from './Child.svelte';

	let x = $state();
	let y = $state(0);
	let deferred = [];

	function delay(s) {
		const d = Promise.withResolvers();
		deferred.push(() => d.resolve(s))
		return d.promise;
	}
</script>

<button onclick={() => x = {x:'universe'}}>x</button>

<button onclick={() => y++}>y++</button>

<button onclick={() => deferred.shift()()}>resolve</button>

{#if x?.x === 'universe'}
	{await delay(x.x)}
	<Child {x} />
{/if}

{#if y > 0}
	<Child {x} />
{/if}
