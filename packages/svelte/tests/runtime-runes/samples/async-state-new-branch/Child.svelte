<script>
	let { x } = $props();
	console.log(x);
	$effect(() => console.log('$effect: '+ x))
</script>

{x}
