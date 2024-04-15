<script>
	import Counter from './Counter.svelte';
	import { global } from './state.svelte.js';

	global.object = { count: 0 };
</script>

<Counter />
