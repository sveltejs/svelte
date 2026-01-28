<script>
	let {display = true} = $props();

	$effect(()=>{
		display = true;
		console.log("effect")
	});
</script>

<button onclick={() => display = !display} >display</button>
