<script>
	import { create_derived } from './state.svelte.js';

	let { promise, num } = $props();

	let derived = await create_derived(
		() => promise,
		() => num
	);

	$effect(() => {
		console.log(`$effect ${derived.value} ${num}`);
	});

	$effect.pre(() => {
		console.log(`$effect.pre ${derived.value} ${num}`);
	});
</script>

<p>{derived.value}{console.log(`template ${derived.value} ${num}`)}</p>
