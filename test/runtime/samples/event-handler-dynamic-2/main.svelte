<script>
	import { writable } from 'svelte/store';

	let number = 0;
	const handler_1 = () => number = 1;
	const handler_2 = () => number = 2;

	let flag = true;

	$: handler_a = flag ? handler_1 : handler_2;
	const handler_b = writable();
	$: handler_b.set(flag ? handler_1 : handler_2);
</script>

<button on:click={() => flag = !flag}>toggle</button>

<p>{number}</p>

<button on:click={handler_a}>handler_a</button>
<button on:click={$handler_b}>handler_b</button>
