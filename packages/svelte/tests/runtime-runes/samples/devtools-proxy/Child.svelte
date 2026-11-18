<script>
	import { store } from './store.svelte.js';

	let { obj } = $props();
</script>

<p>{obj.foo} {obj.nested.bar} {store.x.b}</p>
