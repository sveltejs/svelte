<script>
	let prop;
	$: {
		const obj = get_obj();
		prop = obj.prop;
	}
</script>

<p>{prop}</p>
