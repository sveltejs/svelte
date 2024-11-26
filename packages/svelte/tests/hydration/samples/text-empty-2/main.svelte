<script>
	let { name, remaining } = $props();
</script>

<span>
	<span>{name}</span>{remaining >= 2 ? ',' : ''}
</span>
