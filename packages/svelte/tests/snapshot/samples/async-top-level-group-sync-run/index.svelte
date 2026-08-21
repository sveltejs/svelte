<script>
	let a = await Promise.resolve(1);
	// these should be grouped into one, having an async tick inbetween
	// would change how the code runs and could introduce subtle timing bugs
	let b = a + 1;
	let c = b + 1;
</script>

{c}
