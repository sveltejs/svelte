<script>
	const value = 'line1\nline2\nline3';
	const spread = { name: 'field', value };
</script>

<input data-order="spread-first" {...spread} type="hidden" />
<input data-order="type-first" type="hidden" {...spread} />
