<script>
	let { checked = $bindable(), count = $bindable() } = $props();
	$effect(() => ()=>{
		console.log(count, checked);
	});
</script>

<p>{count}</p>

<button onclick={()=> count-- }></button>
