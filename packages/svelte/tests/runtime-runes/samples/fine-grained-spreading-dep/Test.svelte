<script>
	let { x } = $props();

	$effect(()=>{
		console.log(x);
	});
</script>
