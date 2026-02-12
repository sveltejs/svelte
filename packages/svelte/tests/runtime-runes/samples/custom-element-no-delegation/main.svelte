<script>
	import './MyButton.svelte';
	let outer_count = $state(0);
</script>

<my-button onclick={() => outer_count++}></my-button>
<p>outer: {outer_count}</p>
