<script>
	import Child from './Child.svelte';

	let a = $state(false);
	let b = $state(false);
	let x = $state(0);

	let queue = [];

	function push(label, v, signal) {
		console.log(`${label} ${v}`);
		const d = Promise.withResolvers();

		signal?.addEventListener('abort', () => {
			console.log(`aborted ${label} ${v}`);
			d.reject(signal.reason);
		});

		queue.push({ key: `${label} ${v}`, resolve: () => d.resolve(v) });
		return d.promise;
	}

	function resolve(key) {
		const i = queue.findIndex((e) => e.key === key);
		if (i !== -1) queue.splice(i, 1)[0].resolve();
	}
</script>

<button onclick={() => { a = true; x = 1; }}>a</button>
<button onclick={() => { b = true; x = 2; }}>b</button>
<button onclick={() => resolve('first 1')}>first 1</button>
<button onclick={() => resolve('first 2')}>first 2</button>
<button onclick={() => resolve('second 2')}>second 2</button>

{#if b || a}
	<Child {x} {push} />
{/if}
