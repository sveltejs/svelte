<script>
	import Child from './Child.svelte';

	let a = $state(0);
	let b = $state(0);

	/** @type {Map<string, () => void>} */
	const resolvers = new Map();

	/**
	 * @param {string} name
	 * @param {number} value
	 */
	function push(name, value) {
		const { promise, resolve } = Promise.withResolvers();
		resolvers.set(`${name}:${value}`, () => resolve(value));
		return promise;
	}

	/** @param {string} key */
	function resolve(key) {
		resolvers.get(key)?.();
		resolvers.delete(key);
	}
</script>

<button onclick={() => (a += 1)}>a</button>
<button onclick={() => (b += 10)}>b</button>

{#each ['d:0', 'e:0', 'd:1', 'd:10', 'e:10'] as key}
	<button onclick={() => resolve(key)}>{key}</button>
{/each}

<svelte:boundary>
	<Child {a} {b} {push} />

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
