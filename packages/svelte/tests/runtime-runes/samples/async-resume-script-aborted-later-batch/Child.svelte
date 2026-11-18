<script>
	import { getAbortSignal } from 'svelte';

	let { x, push } = $props();

	let first = $derived(await push('first', x));
	// `x` is never nullish, so `first` isn't read, but referencing it means the
	// deriveds aren't created in parallel, and the script continues in two steps
	let second = $derived(await push('second', x ?? first, getAbortSignal()));

	console.log(`continued with ${first} ${second}`);
</script>

<p>{first} {second}</p>
