<script>
	let x;
	$effect(() => console.log(!!x))
</script>

<div bind:this={x}></div>
