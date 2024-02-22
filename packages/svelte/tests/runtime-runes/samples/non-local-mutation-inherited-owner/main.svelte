<script>
	import Counter from './Counter.svelte';
	import { global } from './state.svelte.js';

	let object = $state({ count: 0 });
	global.object = object;
</script>

<Counter />
