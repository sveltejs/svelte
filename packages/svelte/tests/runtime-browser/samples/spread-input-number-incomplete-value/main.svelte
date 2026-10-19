<script>
	let value = $state('');
</script>

<input {...{ type: 'number', value }} oninput={(e) => (value = e.currentTarget.value)} />
