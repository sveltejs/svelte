<script>
	import Child from './Child.svelte';

	let obj = $state({ foo: 1, nested: { bar: 1 } });
</script>

<button onclick={() => (obj.added = 1)}>add</button>

<Child {obj} />
