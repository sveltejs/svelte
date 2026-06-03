<script>
	import Child from './child.svelte'

	let data = $state({ value: 'hello' });

	const setData = () => (data = { value: 'hello' })
	const clearData = () => (data = undefined)
</script>

<button onclick={setData}>Set data</button>
<button onclick={clearData}>Clear data</button>

{#if data}
  <Child {data} />
{/if}
