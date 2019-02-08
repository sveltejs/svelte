<script>
	export let foo;

	let bar;
	$: bar = foo * 2;
</script>

<p>
	{Math.max(0, foo)}
	{bar}
</p>