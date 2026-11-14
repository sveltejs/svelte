<script>
	import Child from './Child.svelte';
	let revision = $state(0);
	const pending = new Map();

	function delay(kind, value) {
		console.log([kind, value]);
		if (value === 0) return value;
		return new Promise(resolve => pending.set(`${kind}:${value}`, () => resolve(value)));
	}

	function resolve(kind, value) {
		pending.get(`${kind}:${value}`)?.();
	}
</script>

<button onclick={() => revision++}>update</button>
<button onclick={() => resolve('assessment', 2)}>resolve assessment 2</button>
<button onclick={() => resolve('schedule', 2)}>resolve schedule 2</button>
<button onclick={() => resolve('assessment', 1)}>resolve assessment 1</button>

<svelte:boundary>
	<Child {revision} {delay} />
	{#snippet pending()}loading{/snippet}
</svelte:boundary>
