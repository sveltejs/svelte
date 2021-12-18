<script>
	import { onMount } from 'svelte';

	let element;
	let bound = false;
	onMount(() => {
		if (element) bound = true;
	});

</script>

<div bind:this={element}></div>
<p>
	Bound? {bound}
</p>
