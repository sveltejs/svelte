<script>
	import { beforeUpdate, afterUpdate } from "svelte";

	let count = 0;
</script>

<button on:click={()=> count++}></button>
