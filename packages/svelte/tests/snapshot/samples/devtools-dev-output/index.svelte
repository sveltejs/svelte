<script>
	import { counter } from './state.svelte.js';

	let count = $state(0);
	let doubled = $derived(count * 2);
	const todo = $state({ done: false });

	$effect(() => {
		console.log(count);
	});

	$effect.pre(() => {
		todo.done;
	});
</script>

<button onclick={() => count++}>{count} {doubled} {todo.done} {counter.value}</button>
