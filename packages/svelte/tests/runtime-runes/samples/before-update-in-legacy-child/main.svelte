<script>
	import Child from './Child.svelte';
	let object = $state({ count: 0 })
</script>

<button onclick={() => object.count += 1}>
	clicks: {object.count}
</button>

<Child {object} />
