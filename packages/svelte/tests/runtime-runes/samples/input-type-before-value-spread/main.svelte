<script>
	const value = 'line1\nline2\nline3';
	const spread = { name: 'field', value };
</script>

<input {...spread} type="hidden" />
<input type="hidden" {...spread} />
