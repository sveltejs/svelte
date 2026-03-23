<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let x = $state('world');
	let y = $state(0);
	let f;

	const deferred = [];

	function delay(value) {
		if (value !== 'universe') return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}

	function delay2(value) {
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

<button onclick={() => (f = fork(() => {x = 'universe';}))}>x</button>
<button onclick={() => y++}>y++</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
<button onclick={() => deferred.pop()?.()}>pop</button>
<button onclick={() => f.commit()}>commit</button>


{#if x === 'universe'}
	{await delay(x)}
	<Child {x} />
{/if}

<hr>

{#if y > 0}
	<Child x={await delay2(x)} />
{/if}
