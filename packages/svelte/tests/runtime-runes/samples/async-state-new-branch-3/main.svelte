<script>
	import Child from './Child.svelte';

	let x = $state('world');
	let y = $state(0);

	const deferred = [];

	function delay(value) {
		if (value !== 'universe') return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}

	function delay2(value) {
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

<button onclick={() => (x = 'universe')}>x</button>

<button onclick={() => y++}>y++</button>
<button onclick={() => deferred.pop()?.()}>resolve</button>

{#if x === 'universe'}
	{await delay(x)}
	<Child {x} />
{/if}

<hr>

{#if y > 0}
	<Child x={await delay2(x)} />
{/if}
 