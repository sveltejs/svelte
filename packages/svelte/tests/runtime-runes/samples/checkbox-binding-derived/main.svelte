<script>
	import Checkbox from './checkbox.svelte';

	let foo = $state({})

	const schema = $state({
    properties: {
      foo: true,
    },
  })

	function retrieveSchema(schema, value) {
		const cloned = { ...schema, properties: { ...schema.properties } }
		for (const key of Object.keys(value)) {
			cloned.properties[key] = key
		}
		return cloned
	}

	const retrieved = $derived(retrieveSchema(schema, foo));
	const required = $derived(new Set(retrieved.required));
	const properties = $derived(retrieved.properties);
	const keys = $derived(Object.keys(properties));
	let nextKey = 1;
</script>

<button onclick={() => {
	foo[nextKey++] = true
}}>Add</button>

{#each keys as key (key)}
	{@const config = { title: key, required: required.has(key) }}
	<Checkbox bind:value={foo[key]} {config} />
{/each}
