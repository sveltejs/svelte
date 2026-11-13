<script>
	import Child from './Child.svelte';

	let show = $state(false);
	let x = $state(0);
	let gate = $state(false);

	const queue = new Map();

	function push(label, value, signal) {
		const d = Promise.withResolvers();
		signal?.addEventListener('abort', () => d.reject(signal.reason));
		queue.set(`${label} ${value}`, () => d.resolve(value));
		return d.promise;
	}
</script>

<button onclick={() => { show = true; x = 1; }}>show</button>
<button onclick={() => { x = 2; gate = true; }}>update</button>
<button onclick={() => queue.get('value 2')?.()}>value</button>
<button onclick={() => queue.get('gate 2')?.()}>gate</button>
<button onclick={() => queue.get('value 1')?.()}>obsolete</button>

{#if gate || show}
	<Child {x} {push} />
{/if}

{#if gate}
	<span>{await push('gate', x)}</span>
{/if}
