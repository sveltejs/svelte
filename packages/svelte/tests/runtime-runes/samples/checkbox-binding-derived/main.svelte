<script>
	import Checkbox from './checkbox.svelte';

	let foo = $state({})

	const schema = $state({
    foo: true,
  })

	function retrieveSchema() {
		const cloned = { ...schema }
		for (const key of Object.keys(foo)) {
			cloned[key] = key
		}
		return cloned
	}

	const keys = $derived(Object.keys(retrieveSchema()));
	let nextKey = 1;
</script>

<button onclick={() => {
	foo[nextKey++] = true
}}>Add</button>

{#each keys as key (key)}
	<Checkbox bind:value={foo[key]} />
{/each}
