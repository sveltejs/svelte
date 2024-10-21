<script>
	import { onMount } from "svelte";

	let count = $state(0);

	onMount(()=>{
		console.log(count);
	})
</script>

<button onclick={()=> count++}></button>