<script>
	import { beforeUpdate, afterUpdate, onMount } from "svelte";

	let count = 0;

	onMount(()=>{
		console.log(count);
	})
</script>

<button on:click={()=> count++}></button>
