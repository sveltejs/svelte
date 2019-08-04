<script>
	let props;
	$: {
		let { foo, bar, baz, ...others } = $$props;
		props = others;
	}
</script>

<p>{props.qux}</p>