<script>
	import Child from './Child.svelte';

	let a = $state(false);
	let b = $state(false);
	let x = $state(0);

	let queue = [];

	function push(label, v) {
		console.log(`${label} ${v}`);
		const d = Promise.withResolvers();
		queue.push({ key: `${label} ${v}`, resolve: () => d.resolve(v) });
		return d.promise;
	}

	function resolve(key) {
		const i = queue.findIndex((e) => e.key === key);
		if (i !== -1) queue.splice(i, 1)[0].resolve();
	}

	function reset() {
		queue = [];
		a = b = false;
		x = 0;
	}
</script>

<button onclick={() => { a = true; x = 1; }}>a</button>
<button onclick={() => { b = true; x = 2; }}>b</button>
<button onclick={() => resolve('first 1')}>first 1</button>
<button onclick={() => resolve('second 1')}>second 1</button>
<button onclick={() => resolve('first 2')}>first 2</button>
<button onclick={() => resolve('second 2')}>second 2</button>
<button onclick={reset}>reset</button>

{#if b || a}
	<Child {x} {push} />
{/if}
