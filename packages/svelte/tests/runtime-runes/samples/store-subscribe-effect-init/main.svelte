<script>
	import { writable } from 'svelte/store';

	const count = writable(0);
	let ran = 0;

	$effect(() => {
		$count;
		console.log(++ran);
	});
</script>

<button on:click={() => $count++}>increment</button>
