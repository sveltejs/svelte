<script>
	import { fly } from 'svelte/transition';

	// Not read before the outro, by which time the derived is destroyed
	let duration = $derived(10);
</script>

<div in:fly={{ duration: 10 }} out:fly={{ duration }}>
	hello
</div>
