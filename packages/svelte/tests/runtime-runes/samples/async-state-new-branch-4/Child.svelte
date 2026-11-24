<script>
	let { x } = $props();
	// `x` is undefined in the view of a batch that doesn't include the write to `x`
	console.log(x?.x);
	$effect(() => console.log('$effect: '+ x?.x))
</script>

{x?.x}
