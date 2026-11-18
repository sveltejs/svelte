<script>
	import Child from './Child.svelte';
	import { store } from './store.svelte.js';

	let obj = $state({ foo: 1, nested: { bar: 1 } });
	let list = $state([]);
</script>

<button onclick={() => (obj.added = 1)}>add</button>
<button onclick={() => (obj.nested = { bar: 2 })}>nested</button>
<button onclick={() => (list = [{ c: 3 }])}>root</button>
<button onclick={() => (store.x = { b: 2 })}>module</button>

<Child {obj} />
<p>{list[0]?.c}</p>
