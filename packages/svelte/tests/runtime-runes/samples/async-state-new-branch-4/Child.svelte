<script>
	let { x } = $props();
	console.log(x.x);
	$effect(() => console.log('$effect: '+ x.x))
</script>

{x.x}
