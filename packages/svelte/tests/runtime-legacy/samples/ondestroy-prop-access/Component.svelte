<script>
	import { onDestroy } from "svelte";
	export let checked;
	export let count;
	onDestroy(() => {
		console.log(count, checked);
	});
</script>

<p>{count}</p>

<button onclick={()=> count-- }></button>
