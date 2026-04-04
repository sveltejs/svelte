<script>
	import { createCounter } from './counter.svelte.js';
	const counter = createCounter();
</script>

<button onclick={() => counter.increment()}>count: {counter.count}</button>
