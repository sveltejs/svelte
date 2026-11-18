<script>
	import { store } from './store.svelte.js';

	let obj = $state({ nested: { a: 1 } });
	let list = $state([]);
</script>

<button onclick={() => (obj.nested = { b: 2 })}>nested</button>
<button onclick={() => (list = [{ c: 3 }])}>root</button>
<button onclick={() => (store.x = { b: 2 })}>module</button>

<p>{obj.nested.b} {list[0]?.c} {store.x.b}</p>
